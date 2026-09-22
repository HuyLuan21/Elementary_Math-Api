import bcrypt from 'bcrypt'
import admin from 'firebase-admin'
import jwt, { JwtPayload } from 'jsonwebtoken'
import moment from 'moment-timezone'
import { QueryTypes } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

import { BadRequestError, ConflictError, TooManyRequestsError, UnauthorizedError } from '../errors/errors'
import { RefreshToken, User } from '../models'
import { addMailJob } from '../queue/mail'
import createToken from '../utils/createToken'
import hashValue from '../utils/hashValue'
import { sequelize } from '~/config/database'
import { redisClient } from '~/config/redis'
import { RedisKey } from '~/enum/redis'
import { UserRole } from '~/types/user.type'
import handleServiceError from '~/utils/handleServiceError'

class AuthServices {
    generateToken(payload: { sub: string; role: UserRole }) {
        try {
            const token = createToken({ payload }).token
            const refreshToken = createToken({ payload }).refreshToken

            return { token, refreshToken }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    private createAuthChallengeId = async ({ payload }: { payload: { email: string } }) => {
        try {
            const hasAuthChallengeId = await redisClient.get(`${RedisKey.AUTH_CHALLENGE_ID}${payload.email}`)

            if (hasAuthChallengeId) {
                await redisClient.del(`${RedisKey.AUTH_CHALLENGE_ID}${payload.email}`)
            }

            const auth_challenge_id = uuidv4()

            await redisClient.set(
                `${RedisKey.AUTH_CHALLENGE_ID}${payload.email}`,
                JSON.stringify({
                    auth_challenge_id,
                    created_at: moment.tz(new Date(), 'Asia/Ho_Chi_Minh').format(),
                }),
                {
                    EX: Number(process.env.VERIFY_AUTH_TTL),
                },
            )

            return auth_challenge_id
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    register = async ({ full_name, email, password }: { email: string; password: string; full_name: string }) => {
        try {
            const passwordHashed = await hashValue(password)

            const splitName = full_name.trim().split(' ')
            const firstName = splitName.length === 1 ? '' : splitName.slice(0, splitName.length - 1).join(' ')
            const lastName = splitName.slice(splitName.length - 1).join(' ')

            const [user, created]: [User, boolean] = await User.unscoped().findOrCreate<any>({
                where: {
                    email,
                },
                defaults: {
                    email,
                    password_hash: passwordHashed,
                    full_name,
                    first_name: firstName,
                    last_name: lastName,
                    role: 'parent',
                    status: 'active',
                },
            })

            if (!created) {
                const isPasswordValid = bcrypt.compareSync(password, user.get('password_hash')!)

                if (!user.is_active && isPasswordValid) {
                    await this.sendVerifyCode({ email, type: 'activate_account' })
                } else {
                    throw new ConflictError({ message: 'Tài khoản đã tồn tại' })
                }
            }

            const auth_challenge_id = await this.createAuthChallengeId({ payload: { email: user.get('email')! } })

            delete user.dataValues.password_hash
            delete user.dataValues.email

            return { user, auth_challenge_id }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    login = async ({ email, password }: { email: string; password: string }) => {
        try {
            const user = await User.unscoped().findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                throw new UnauthorizedError({ message: 'Email hoặc mật khẩu không chính xác' })
            }

            const isPasswordValid = bcrypt.compareSync(password, user.get('password_hash')!)

            if (!isPasswordValid) {
                throw new UnauthorizedError({ message: 'Email hoặc mật khẩu không chính xác' })
            }

            const payload = {
                sub: user.dataValues.id,
                role: user.dataValues.role,
            }

            const { token, refreshToken } = this.generateToken(payload)

            if (!user.is_active) {
                const auth_challenge_id = await this.createAuthChallengeId({ payload: { email: user.get('email')! } })

                await this.sendVerifyCode({ email: user.get('email')!, type: 'activate_account' })

                return { user, auth_challenge_id, token, refreshToken }
            }

            delete user.dataValues.password_hash
            delete user.dataValues.email

            return { token, refreshToken, user }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    logout = async ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => {
        try {
            if (access_token) {
                // save token to blacklist and delete refreshToken in database
                await Promise.all([
                    redisClient.set(`blacklist-${access_token}`, 'true', { EX: Number(process.env.EXPIRED_TOKEN) }),
                    RefreshToken.destroy({ where: { refresh_token } }),
                ])
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    private getLastNickname = async (nickname: string) => {
        const [rows] = await sequelize.query(
            `
                SELECT 
                    COALESCE(
                        MAX(
                            CAST(
                                SUBSTRING(nickname, LENGTH(:nickname) + 1) 
                                AS UNSIGNED
                            )
                        ), 
                        NULL
                    ) as max_num
                FROM users 
                WHERE nickname REGEXP CONCAT('^', :nickname, '[0-9]+$')  
                OR nickname = :nickname;
            `,
            {
                replacements: {
                    nickname: nickname,
                },
                type: QueryTypes.RAW,
            },
        )

        return (rows[0] as { max_num: number | null })?.max_num
    }

    loginWithToken = async ({ token }: { token: string }) => {
        try {
            if (!admin.apps.length) {
                throw new BadRequestError({ message: 'Firebase service chưa được cấu hình trên server' })
            }

            const decodedToken = await admin.auth().verifyIdToken(token)

            const {
                email: tokenEmail,
                name,
                picture,
                firebase: { sign_in_provider },
            } = decodedToken

            let email = tokenEmail

            if (sign_in_provider === 'github.com' && !email) {
                const firebaseUser = await admin.auth().getUser(decodedToken.uid)

                email = firebaseUser.providerData[0].email
            }

            if (!email) {
                throw new BadRequestError({ message: 'Không thể lấy email từ firebase' })
            }

            let hasUser = await User.findOne({
                where: {
                    email,
                },
            })

            if (hasUser && hasUser.sign_in_provider !== sign_in_provider) {
                throw new ConflictError({
                    message: `Tài khoản này đã được sử dụng với provider ${hasUser.sign_in_provider}`,
                })
            }

            const splitName = name.split(' ')

            const firstName = splitName.length === 1 ? '' : splitName.slice(0, splitName.length - 1).join(' ')
            const lastName = splitName.slice(splitName.length - 1).join(' ')

            const emailPrefix = email.split('@')[0]

            if (!hasUser) {
                const lastNickname = await this.getLastNickname(emailPrefix)

                const nickname = lastNickname !== null ? `${emailPrefix}${Number(lastNickname) + 1}` : emailPrefix

                hasUser = await User.create({
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    full_name: name,
                    nickname,
                    avatar_path: picture,
                    role: 'user',
                    is_active: true,
                    is_blocked: false,
                    sign_in_provider: sign_in_provider as 'google.com' | 'github.com',
                })
            }

            const { token: accessToken, refreshToken } = this.generateToken({
                sub: hasUser.id,
                role: hasUser.get('role'),
            })

            if (!hasUser.is_active) {
                const auth_challenge_id = await this.createAuthChallengeId({
                    payload: { email: hasUser.get('email')! },
                })

                await this.sendVerifyCode({ email: hasUser.get('email')!, type: 'activate_account' })

                return { user: hasUser, auth_challenge_id, token: accessToken, refreshToken }
            }

            return { token: accessToken, refreshToken, user: hasUser }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    refreshToken = async ({ refresh_token }: { refresh_token: string }) => {
        try {
            let decoded: JwtPayload | null = null

            try {
                decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload
            } catch (error: any) {
                if (error.message === 'jwt expired') {
                    await RefreshToken.destroy({ where: { refresh_token } })

                    throw new UnauthorizedError({ message: 'Refresh token đã hết hạn' })
                }

                throw new BadRequestError({ message: error.message })
            }

            if (!decoded) {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            const hasRefreshToken = await RefreshToken.findOne({
                where: { refresh_token },
            })

            // if have'nt refreshToken in database
            if (!hasRefreshToken) {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            const payload = { sub: decoded.sub as string }

            if (!decoded.exp) {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            // Giữ giá trị exp token cũ gắn vào token mới
            const exp = Math.floor((decoded.exp * 1000 - Date.now()) / 1000)

            const newAccessToken = createToken({ payload }).token
            const newRefreshToken = createToken({ payload, expRefresh: exp }).refreshToken

            await RefreshToken.update(
                {
                    refresh_token: newRefreshToken,
                },
                {
                    where: {
                        refresh_token,
                    },
                },
            )

            return { newAccessToken, newRefreshToken }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    sendResetPasswordEmail = async ({ email }: { email: string }) => {
        try {
            const hasToken = await redisClient.get(`${RedisKey.FORGOT_PASSWORD_TOKEN}${email}`)

            const decodedToken: {
                token: string
                created_at: string
            } = JSON.parse(hasToken || '{}')

            const now = moment().tz('Asia/Ho_Chi_Minh').toDate()

            if (decodedToken.created_at) {
                const diff = now.getTime() - new Date(decodedToken.created_at).getTime()

                if (diff < 60 * 1000) {
                    throw new TooManyRequestsError({
                        message: `Quá nhiều yêu cầu, vui lòng thử lại sau ${60 - Math.floor(diff / 1000)} giây`,
                    })
                }
            }

            await this.sendVerifyCode({ email, type: 'reset_password' })
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    sendVerifyCode = async ({ email, type }: { email: string; type: 'activate_account' | 'reset_password' }) => {
        try {
            await addMailJob({ email, type })
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    resetPassword = async ({ email, token, password }: { email: string; token: string; password: string }) => {
        try {
            // validate token

            await this.verifyForgotPasswordToken({ email, token })

            // Update password
            const passwordHashed = await hashValue(password)

            await User.update({ password_hash: passwordHashed }, { where: { email } })

            await redisClient.del(`${RedisKey.FORGOT_PASSWORD_TOKEN}${email}`)
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    verifyAccount = async ({ email, code }: { email: string; code: string }) => {
        try {
            const hasCode: string | null = await redisClient.get(`${RedisKey.ACTIVATE_ACCOUNT}${email}`)

            if (!hasCode || hasCode !== code) {
                throw new UnauthorizedError({ message: 'Mã xác minh không hợp lệ hoặc đã hết hạn' })
            }

            const user = await User.findOne({ where: { email } })

            if (!user) {
                throw new UnauthorizedError({ message: 'Email hoặc mã xác minh không hợp lệ' })
            }

            if (user.is_active) {
                throw new UnauthorizedError({ message: 'Tài khoản đã được xác thực' })
            }

            if (user) {
                user.set('is_active', true)
                await user.save()
            }

            await redisClient.del(`${RedisKey.ACTIVATE_ACCOUNT}${email}`)
            await redisClient.del(`${RedisKey.AUTH_CHALLENGE_ID}${email}`)

            const { token, refreshToken } = this.generateToken({
                sub: user.id,
                role: user.get('role'),
            })

            return { token, refreshToken }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    verifyAuthChallengeId = async ({ auth_challenge_id, email }: { auth_challenge_id: string; email: string }) => {
        try {
            const payload = await redisClient.get(`${RedisKey.AUTH_CHALLENGE_ID}${email}`)

            if (!payload) {
                throw new UnauthorizedError({ message: 'Auth challenge ID không hợp lệ hoặc đã hết hạn' })
            }

            const payloadData = JSON.parse(payload)

            if (payloadData.auth_challenge_id !== auth_challenge_id) {
                throw new UnauthorizedError({ message: 'Auth challenge ID không hợp lệ hoặc đã hết hạn' })
            }

            // check user active status
            const user = await User.findOne({ where: { email } })
            if (!user) {
                throw new UnauthorizedError({ message: 'Tài khoản hoặc tài khoản không tồn tại' })
            }

            if (user.is_active) {
                throw new BadRequestError({ message: 'Tài khoản đã được xác thực' })
            }

            return payloadData
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    verifyForgotPasswordToken = async ({ email, token }: { email: string; token: string }) => {
        try {
            const hasToken = await redisClient.get(`${RedisKey.FORGOT_PASSWORD_TOKEN}${email}`)

            const decodedToken: {
                token: string
                created_at: string
            } = JSON.parse(hasToken || '{}')

            if (!hasToken || decodedToken.token !== token) {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }
}

export default new AuthServices()

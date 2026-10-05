import bcrypt from 'bcrypt'
import admin from 'firebase-admin'
import jwt, { JwtPayload } from 'jsonwebtoken'
import moment from 'moment-timezone'
import { Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

import { BadRequestError, ConflictError, TooManyRequestsError, UnauthorizedError } from '../errors/errors'
import { RefreshToken, User } from '../models'
import { addMailJob } from '../queue/mail'
import createToken from '../utils/createToken'
import hashValue from '../utils/hashValue'
import { redisClient } from '~/config/redis'
import { RedisKey } from '~/enum/redis'
import { UserRole } from '~/types/user.type'
import handleServiceError from '~/utils/handleServiceError'

class AuthServices {
    // Token
    generateToken(payload: { sub: string; role: UserRole }) {
        try {
            const token = createToken({ payload }).token
            const refreshToken = createToken({ payload }).refreshToken

            return { token, refreshToken }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    storeRefreshToken = async ({ userId, refreshToken }: { userId: string; refreshToken: string }) => {
        try {
            await RefreshToken.create({
                user_id: userId,
                refresh_token: refreshToken,
            })
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Auth challenge
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

    // Đăng ký
    register = async ({ full_name, email, password }: { email: string; password: string; full_name: string }) => {
        try {
            const passwordHashed = await hashValue(password)

            const [user, created]: [User, boolean] = await User.unscoped().findOrCreate<any>({
                where: {
                    email,
                },
                defaults: {
                    email,
                    password_hash: passwordHashed,
                    full_name: full_name.trim(),
                    role: 'parent',
                    status: 'active',
                },
            })

            if (!created) {
                const isPasswordValid = bcrypt.compareSync(password, user.get('password_hash')!)

                if (!user.is_active && isPasswordValid) {
                    await this.sendVerifyCode({
                        email,
                        type: 'activate_account',
                    })
                } else {
                    throw new ConflictError({
                        message: 'Tài khoản đã tồn tại',
                    })
                }
            }

            const auth_challenge_id = await this.createAuthChallengeId({
                payload: {
                    email: user.get('email')!,
                },
            })

            const { password_hash: _passwordHash, pin_hash: _pinHash, ...userData } = user.toJSON()

            return {
                user: userData,
                auth_challenge_id,
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Đăng nhập
    login = async ({ email, password }: { email: string; password: string }) => {
        try {
            const user = await User.unscoped().findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                throw new UnauthorizedError({
                    message: 'Email hoặc mật khẩu không chính xác',
                })
            }

            if (user.status === 'locked') {
                throw new UnauthorizedError({
                    message: 'Tài khoản đã bị khóa',
                })
            }

            const isPasswordValid = bcrypt.compareSync(password, user.get('password_hash')!)

            if (!isPasswordValid) {
                throw new UnauthorizedError({
                    message: 'Email hoặc mật khẩu không chính xác',
                })
            }

            const payload = {
                sub: user.dataValues.id,
                role: user.dataValues.role as UserRole,
            }

            const { token, refreshToken } = this.generateToken(payload)

            const { password_hash: _passwordHash, email: _email, ...userData } = user.toJSON()

            return {
                token,
                refreshToken,
                user,
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    setupPin = async ({ userId, pin }: { userId: string; pin: string }) => {
        try {
            const pinHash = await hashValue(pin)
            const [updatedRows] = await User.unscoped().update(
                {
                    pin_hash: pinHash,
                    pin_enabled: true,
                },
                {
                    where: {
                        id: userId,
                        pin_enabled: false,
                        pin_hash: null,
                    },
                },
            )

            if (updatedRows !== 1) {
                const user = await User.unscoped().findByPk(userId, {
                    attributes: ['id', 'pin_enabled', 'pin_hash'],
                })

                if (!user) {
                    throw new UnauthorizedError({
                        message: 'Tài khoản không tồn tại',
                        error: { code: 'TOKEN_VERIFICATION_FAILED' },
                    })
                }

                throw new ConflictError({
                    message: 'PIN đã được thiết lập',
                    error: { code: 'PIN_ALREADY_SET' },
                })
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    verifyPin = async ({ userId, pin }: { userId: string; pin: string }) => {
        try {
            const user = await User.unscoped().findByPk(userId, {
                attributes: ['id', 'pin_enabled', 'pin_hash'],
            })

            if (!user) {
                throw new UnauthorizedError({
                    message: 'Tài khoản không tồn tại',
                    error: { code: 'TOKEN_VERIFICATION_FAILED' },
                })
            }

            if (!user.pin_enabled || !user.pin_hash) {
                throw new ConflictError({
                    message: 'PIN chưa được thiết lập',
                    error: { code: 'PIN_NOT_SET' },
                })
            }

            const isPinValid = await bcrypt.compare(pin, user.pin_hash)

            if (!isPinValid) {
                throw new UnauthorizedError({
                    message: 'PIN không chính xác',
                    error: { code: 'PIN_INVALID' },
                })
            }

            return { verified: true }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    changePin = async ({ userId, oldPin, newPin }: { userId: string; oldPin: string; newPin: string }) => {
        try {
            const user = await User.unscoped().findByPk(userId, {
                attributes: ['id', 'pin_enabled', 'pin_hash'],
            })

            if (!user) {
                throw new UnauthorizedError({
                    message: 'Tài khoản không tồn tại',
                    error: { code: 'TOKEN_VERIFICATION_FAILED' },
                })
            }

            if (!user.pin_enabled || !user.pin_hash) {
                throw new ConflictError({
                    message: 'PIN chưa được thiết lập',
                    error: { code: 'PIN_NOT_SET' },
                })
            }

            const isOldPinValid = await bcrypt.compare(oldPin, user.pin_hash)

            if (!isOldPinValid) {
                throw new UnauthorizedError({
                    message: 'Mã PIN hiện tại không chính xác',
                    error: { code: 'OLD_PIN_INVALID' },
                })
            }

            const newPinHash = await hashValue(newPin)
            await user.update({
                pin_hash: newPinHash,
                pin_enabled: true,
            })

            return { success: true }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Đăng xuất
    logout = async ({ access_token, refresh_token }: { access_token?: string; refresh_token?: string }) => {
        try {
            const revocations: Promise<unknown>[] = []

            if (access_token) {
                revocations.push(
                    redisClient.set(`blacklist-${access_token}`, 'true', {
                        EX: Math.max(1, Number(process.env.EXPIRED_TOKEN) || 1),
                    }),
                )
            }

            if (refresh_token) {
                revocations.push(RefreshToken.destroy({ where: { refresh_token } }))
            }

            await Promise.all(revocations)
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Firebase
    loginWithToken = async ({ token }: { token: string }) => {
        try {
            if (!admin.apps.length) {
                throw new BadRequestError({
                    message: 'Firebase service chưa được cấu hình trên server',
                })
            }

            const decodedToken = await admin.auth().verifyIdToken(token)

            const email = decodedToken.email

            if (!email) {
                throw new BadRequestError({
                    message: 'Không thể lấy email từ Firebase',
                })
            }

            const fullName = decodedToken.name?.trim() || email.split('@')[0]

            let user = await User.unscoped().findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                user = await User.create({
                    email,
                    password_hash: await hashValue(uuidv4()),
                    full_name: fullName,
                    role: 'parent',
                    status: 'active',
                })
            }

            if (user.status === 'locked') {
                throw new UnauthorizedError({
                    message: 'Tài khoản đã bị khóa',
                })
            }

            const { token: accessToken, refreshToken } = this.generateToken({
                sub: user.id,
                role: user.role as UserRole,
            })

            const { password_hash: _passwordHash, email: _email, ...userData } = user.toJSON()

            return {
                token: accessToken,
                refreshToken,
                user,
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Refresh token
    refreshToken = async ({ refresh_token }: { refresh_token: string }) => {
        try {
            let decoded: JwtPayload | null = null

            try {
                decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload
            } catch (error: any) {
                if (error.name === 'TokenExpiredError' || error.message === 'jwt expired') {
                    await RefreshToken.destroy({ where: { refresh_token } })
                    throw new UnauthorizedError({ message: 'Refresh token đã hết hạn' })
                }

                throw new BadRequestError({ message: error.message || 'Token không hợp lệ' })
            }

            if (!decoded || typeof decoded.sub !== 'string') {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            const tokenRecord = await RefreshToken.findOne({
                where: { refresh_token },
            })

            if (!tokenRecord || tokenRecord.user_id !== decoded.sub) {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            const user = await User.findByPk(decoded.sub)

            if (!user) {
                throw new UnauthorizedError({
                    message: 'Tài khoản không tồn tại',
                })
            }

            if (user.status === 'locked') {
                throw new UnauthorizedError({
                    message: 'Tài khoản đã bị khóa',
                })
            }

            if (!decoded.exp) {
                throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            // Giữ giá trị exp token cũ gắn vào token mới
            const remainingSeconds = Math.floor((decoded.exp * 1000 - Date.now()) / 1000)
            if (remainingSeconds <= 0) {
                await RefreshToken.destroy({ where: { refresh_token } })
                throw new UnauthorizedError({ message: 'Refresh token đã hết hạn' })
            }

            const payload = {
                sub: user.id,
                role: user.role,
            }

            const newAccessToken = createToken({ payload }).token
            const newRefreshToken = createToken({
                payload,
                expRefresh: remainingSeconds,
            }).refreshToken

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

            return {
                newAccessToken,
                newRefreshToken,
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Gửi email reset mật khẩu
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

            await this.sendVerifyCode({
                email,
                type: 'reset_password',
            })
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Gửi mã xác minh
    sendVerifyCode = async ({ email, type }: { email: string; type: 'activate_account' | 'reset_password' }) => {
        try {
            await addMailJob({
                email,
                type,
            })
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Đặt lại mật khẩu
    resetPassword = async ({ email, token, password }: { email: string; token: string; password: string }) => {
        try {
            await this.verifyForgotPasswordToken({
                email,
                token,
            })

            const passwordHashed = await hashValue(password)

            await User.update(
                {
                    password_hash: passwordHashed,
                },
                {
                    where: {
                        email,
                    },
                },
            )

            await redisClient.del(`${RedisKey.FORGOT_PASSWORD_TOKEN}${email}`)
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Xác minh tài khoản
    verifyAccount = async ({ email, code }: { email: string; code: string }) => {
        try {
            const hasCode: string | null = await redisClient.get(`${RedisKey.ACTIVATE_ACCOUNT}${email}`)

            if (!hasCode || hasCode !== code) {
                throw new UnauthorizedError({
                    message: 'Mã xác minh không hợp lệ hoặc đã hết hạn',
                })
            }

            const user = await User.findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                throw new UnauthorizedError({
                    message: 'Email hoặc mã xác minh không hợp lệ',
                })
            }

            if (user.is_active) {
                throw new UnauthorizedError({
                    message: 'Tài khoản đã được xác thực',
                })
            }

            user.set('status', 'active')
            await user.save()

            await redisClient.del(`${RedisKey.ACTIVATE_ACCOUNT}${email}`)

            await redisClient.del(`${RedisKey.AUTH_CHALLENGE_ID}${email}`)

            const { token, refreshToken } = this.generateToken({
                sub: user.id,
                role: user.role as UserRole,
            })

            return {
                token,
                refreshToken,
                user,
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Kiểm tra auth challenge
    verifyAuthChallengeId = async ({ auth_challenge_id, email }: { auth_challenge_id: string; email: string }) => {
        try {
            const payload = await redisClient.get(`${RedisKey.AUTH_CHALLENGE_ID}${email}`)

            if (!payload) {
                throw new UnauthorizedError({
                    message: 'Auth challenge ID không hợp lệ hoặc đã hết hạn',
                })
            }

            const payloadData = JSON.parse(payload)

            if (payloadData.auth_challenge_id !== auth_challenge_id) {
                throw new UnauthorizedError({
                    message: 'Auth challenge ID không hợp lệ hoặc đã hết hạn',
                })
            }

            const user = await User.findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                throw new UnauthorizedError({
                    message: 'Tài khoản không tồn tại',
                })
            }

            if (user.is_active) {
                throw new BadRequestError({
                    message: 'Tài khoản đã được xác thực',
                })
            }

            return payloadData
        } catch (error: any) {
            return handleServiceError(error)
        }
    }

    // Kiểm tra token reset mật khẩu
    verifyForgotPasswordToken = async ({ email, token }: { email: string; token: string }) => {
        try {
            const hasToken = await redisClient.get(`${RedisKey.FORGOT_PASSWORD_TOKEN}${email}`)

            const decodedToken: {
                token: string
                created_at: string
            } = JSON.parse(hasToken || '{}')

            if (!hasToken || decodedToken.token !== token) {
                throw new UnauthorizedError({
                    message: 'Token không hợp lệ hoặc đã hết hạn',
                })
            }
        } catch (error: any) {
            return handleServiceError(error)
        }
    }
}

export default new AuthServices()

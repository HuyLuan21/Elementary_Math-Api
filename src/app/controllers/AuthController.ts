import { NextFunction, Request, Response } from 'express'

import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/errors'
import { User } from '../models'
import AuthService from '../services/AuthService'
import UserService from '../services/UserService'
import { clearCookie, setCookie } from '../utils/cookiesManager'
import {
    ChangePinRequest,
    LoginRequest,
    LoginWithTokenRequest,
    PinRequest,
    RegisterRequest,
    ResetPassRequest,
    sendResetPassEmailRequest,
    SendVerifyCodeRequest,
    VerifyAccountRequest,
    VerifyAuthChallengeIdRequest,
    VerifyForgotPasswordTokenRequest,
} from '../validators/api/authSchema'
import { IRequest } from '~/type'

class AuthController {
    // [GET] /auth/me
    getCurrentUser = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub

            if (!userId) {
                return next(new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' }))
            }

            const user = await UserService.getUserById(userId)

            res.json({
                data: user,
            })
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                clearCookie({
                    res,
                    cookies: ['access_token', 'refresh_token'],
                    req,
                })
            }

            return next(error)
        }
    }

    // Gửi token về client
    sendToClient = async ({
        res,
        user,
        token,
        refreshToken,
        status = 200,
        req,
    }: {
        res: Response
        user: User
        token: string
        refreshToken: string
        status?: number
        req: Request
    }) => {
        await AuthService.storeRefreshToken({
            userId: user.id,
            refreshToken,
        })

        setCookie({
            res,
            cookies: [
                {
                    name: 'access_token',
                    value: token,
                },
                {
                    name: 'refresh_token',
                    value: refreshToken,
                },
            ],
            req,
        })

        const { password_hash: _passwordHash, pin_hash: _pinHash, ...userData } = user.toJSON()

        res.status(status).json({
            data: userData,
            access_token: token,
            refresh_token: refreshToken,
        })
    }

    // [POST] /auth/register
    register = async (req: RegisterRequest, res: Response, next: NextFunction) => {
        try {
            const { full_name, email, password } = req.body

            const { user, auth_challenge_id } = await AuthService.register({
                full_name,
                email,
                password,
            })

            res.status(201).json({
                data: {
                    user,
                },
                meta: {
                    auth_challenge_id,
                },
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/login
    login = async (req: LoginRequest, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            const { token, refreshToken, user } = await AuthService.login({
                email,
                password,
            })

            await this.sendToClient({
                res,
                user,
                token,
                refreshToken,
                req,
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/pin/setup
    setupPin = async (req: PinRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub

            if (!userId) {
                return next(new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' }))
            }

            await AuthService.setupPin({ userId, pin: req.body.pin })

            res.status(200).json({
                data: {
                    pin_enabled: true,
                },
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/pin/verify
    verifyPin = async (req: PinRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub

            if (!userId) {
                return next(new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' }))
            }

            const result = await AuthService.verifyPin({ userId, pin: req.body.pin })

            res.status(200).json({
                data: result,
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/pin/change
    changePin = async (req: ChangePinRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub

            if (!userId) {
                return next(new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' }))
            }

            const result = await AuthService.changePin({
                userId,
                oldPin: req.body.oldPin,
                newPin: req.body.newPin,
            })

            res.status(200).json({
                message: 'Đổi mã PIN thành công',
                data: result,
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/logout
    logout = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization

            const access_token =
                req.cookies?.access_token ||
                (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.body?.access_token)

            const refresh_token = req.cookies?.refresh_token || req.body?.refresh_token

            await AuthService.logout({
                access_token,
                refresh_token,
            })

            clearCookie({
                res,
                cookies: ['access_token', 'refresh_token'],
                req,
            })

            res.sendStatus(204)
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/loginwithtoken
    loginWithToken = async (req: LoginWithTokenRequest, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body

            const {
                token: accessToken,
                refreshToken,
                user,
            } = await AuthService.loginWithToken({
                token,
            })

            await this.sendToClient({
                res,
                user,
                token: accessToken,
                refreshToken,
                req,
            })
        } catch (error) {
            return next(error)
        }
    }

    // [GET/POST] /auth/refresh
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refresh_token =
                req.cookies?.refresh_token || req.body?.refresh_token || (req.headers['x-refresh-token'] as string)

            const { newAccessToken, newRefreshToken } = await AuthService.refreshToken({
                refresh_token,
            })

            setCookie({
                res,
                cookies: [
                    {
                        name: 'access_token',
                        value: newAccessToken,
                    },
                    {
                        name: 'refresh_token',
                        value: newRefreshToken,
                    },
                ],
                req,
            })

            res.status(200).json({
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            })
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                clearCookie({
                    res,
                    cookies: ['access_token', 'refresh_token'],
                    req,
                })
            }

            return next(error)
        }
    }

    // [GET] /auth/verification/send
    sendVerifyCode = async (req: SendVerifyCodeRequest, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            const user = await User.findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                return next(
                    new NotFoundError({
                        message: 'Email không tồn tại',
                    }),
                )
            }

            if (user.status === 'active') {
                return next(
                    new BadRequestError({
                        message: 'Tài khoản đã được xác thực',
                    }),
                )
            }

            await AuthService.sendVerifyCode({
                email,
                type: 'activate_account',
            })

            res.sendStatus(202)
        } catch (error: any) {
            return next(error)
        }
    }

    // [GET] /auth/forgot-password
    sendResetPassEmail = async (req: sendResetPassEmailRequest, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body

            const user = await User.findOne({
                where: {
                    email,
                },
            })

            if (!user) {
                return next(
                    new NotFoundError({
                        message: 'Email không tồn tại',
                    }),
                )
            }

            await AuthService.sendResetPasswordEmail({
                email,
            })

            res.sendStatus(202)
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/reset-password
    resetPassword = async (req: ResetPassRequest, res: Response, next: NextFunction) => {
        try {
            const { email, token, password } = req.body

            await AuthService.resetPassword({
                email,
                token,
                password,
            })

            res.json({
                message: 'Password reset successfully',
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/verification/active
    verifyAccount = async (req: VerifyAccountRequest, res: Response, next: NextFunction) => {
        try {
            const { email, code } = req.body

            const { token, refreshToken, user } = await AuthService.verifyAccount({
                email,
                code,
            })

            await AuthService.storeRefreshToken({
                userId: user.id,
                refreshToken,
            })

            setCookie({
                res,
                cookies: [
                    {
                        name: 'access_token',
                        value: token,
                    },
                    {
                        name: 'refresh_token',
                        value: refreshToken,
                    },
                ],
                req,
            })

            res.status(200).json({
                message: 'Account verified successfully',
            })
        } catch (error) {
            return next(error)
        }
    }

    // [GET] /auth/verification/challenge/:auth_challenge_id
    verifyAuthChallengeId = async (req: VerifyAuthChallengeIdRequest, res: Response, next: NextFunction) => {
        try {
            const { auth_challenge_id } = req.params
            const { email } = req.query

            const payload = await AuthService.verifyAuthChallengeId({
                auth_challenge_id,
                email: email as string,
            })

            res.json({
                data: payload,
            })
        } catch (error) {
            return next(error)
        }
    }

    // [POST] /auth/forgot-password/verify
    verifyForgotPasswordToken = async (req: VerifyForgotPasswordTokenRequest, res: Response, next: NextFunction) => {
        try {
            const { token, email } = req.body

            await AuthService.verifyForgotPasswordToken({
                token,
                email,
            })

            res.sendStatus(204)
        } catch (error) {
            return next(error)
        }
    }
}

export default new AuthController()

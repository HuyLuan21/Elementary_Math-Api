import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'

import { User } from '../models'
import { clearCookie } from '../utils/cookiesManager'
import redisClient from '~/config/redis/redisClient'
import { AuthTokenPayload, UserRole } from '~/types/user.type'
import { IRequest } from '~/type'

const isUserRole = (role: unknown): role is UserRole => role === 'parent' || role === 'admin'

const verifyToken = async (req: IRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const access_token =
        req.cookies?.access_token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader)

    if (!access_token) {
        res.status(401).json({
            message: 'Failed to authenticate because token was not provided.',
            status: 401,
        })
        return
    }

    try {
        const tokenInvalid = await redisClient.get(`blacklist-${access_token}`)

        if (tokenInvalid) {
            clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })

            res.status(401).json({
                message: 'Failed to authenticate because of bad credentials or an invalid authorization header.',
                status: 401,
            })
            return
        }

        let verified: jwt.JwtPayload

        try {
            const decoded = jwt.verify(access_token, process.env.JWT_SECRET as string)
            if (typeof decoded === 'string') {
                throw new jwt.JsonWebTokenError('Invalid token payload')
            }
            verified = decoded
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                clearCookie({ res, cookies: ['access_token'], req })

                res.status(401).set('x-refresh-token-required', 'true').json({
                    error: 'Failed to authenticate because of expired token.',
                    code: 'TOKEN_EXPIRED',
                })
                return
            }

            clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })

            res.status(401).json({
                error: 'Failed to authenticate because of bad credentials or an invalid authorization header.',
                code: 'TOKEN_VERIFICATION_FAILED',
            })
            return
        }

        if (
            typeof verified.sub !== 'string' ||
            typeof verified.exp !== 'number' ||
            !isUserRole(verified.role)
        ) {
            clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })

            res.status(401).json({
                error: 'Failed to authenticate because of bad credentials or an invalid authorization header.',
                code: 'TOKEN_VERIFICATION_FAILED',
            })
            return
        }

        const user = await User.findByPk(verified.sub)

        if (!user) {
            clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })

            res.status(401).json({
                message: 'Tài khoản không tồn tại.',
                status: 401,
            })
            return
        }

        if (user.status === 'locked') {
            clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })

            res.status(401).json({
                message: 'Tài khoản của bạn đã bị chặn.',
                status: 401,
            })
            return
        }

        if (user.role !== verified.role) {
            clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })

            res.status(401).json({
                error: 'Failed to authenticate because of bad credentials or an invalid authorization header.',
                code: 'TOKEN_VERIFICATION_FAILED',
            })
            return
        }

        req.decoded = verified as AuthTokenPayload
        req.role = user.role
        return next()
    } catch (error) {
        return next(error)
    }
}

export default verifyToken

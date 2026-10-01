import { NextFunction, Response } from 'express'

import { NotFoundError, UnauthorizedError } from '../errors/errors'
import UserService from '../services/UserService'
import { clearCookie } from '../utils/cookiesManager'
import { IRequest } from '~/type'

class MeController {
    // [GET] /auth/me
    getCurrentUser = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub

            if (!userId) {
                return next(new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' }))
            }

            const user = await UserService.getUserById(userId)

            res.json({ data: user })
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                clearCookie({ res, cookies: ['access_token', 'refresh_token'], req })
            }

            return next(error)
        }
    }
}

export default new MeController()

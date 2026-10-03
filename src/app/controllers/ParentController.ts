import { NextFunction, Response } from 'express'

import { UnauthorizedError } from '../errors/errors'
import ParentService from '../services/ParentService'
import { IRequest } from '~/type'

class ParentController {
    getOverview = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })

            const profiles = await ParentService.getOverview(userId)

            res.json({
                data: { profiles },
            })
        } catch (error) {
            next(error)
        }
    }

    getProfileReport = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })

            const report = await ParentService.getProfileReport(userId, req.params.profileId)

            res.json({
                data: report,
            })
        } catch (error) {
            next(error)
        }
    }
}

export default new ParentController()

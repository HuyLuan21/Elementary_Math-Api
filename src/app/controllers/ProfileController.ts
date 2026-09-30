import { NextFunction, Response } from 'express'

import ProfileService from '../services/ProfileService'
import { IRequest } from '~/type'

class ProfileController {
    // [GET] /api/profiles
    getProfiles = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded.sub
            const profiles = await ProfileService.getProfiles(userId)
            res.json({ data: profiles })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /api/profiles/:id
    getProfileById = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded.sub
            const profileId = req.params.id
            const profile = await ProfileService.getProfileById(userId, profileId)
            res.json({ data: profile })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /api/profiles
    createProfile = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded.sub
            const { display_name, avatar_url, birth_date } = req.body

            if (!display_name || !display_name.trim()) {
                return res.status(400).json({ message: 'Tên hiển thị không được để trống' })
            }

            const newProfile = await ProfileService.createProfile(userId, {
                display_name,
                avatar_url,
                birth_date,
            })

            res.status(201).json({
                message: 'Tạo hồ sơ học viên thành công',
                data: newProfile,
            })
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /api/profiles/:id
    updateProfile = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded.sub
            const profileId = req.params.id
            const { display_name, avatar_url, birth_date } = req.body

            const updatedProfile = await ProfileService.updateProfile(userId, profileId, {
                display_name,
                avatar_url,
                birth_date,
            })

            res.json({
                message: 'Cập nhật hồ sơ thành công',
                data: updatedProfile,
            })
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /api/profiles/:id
    deleteProfile = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded.sub
            const profileId = req.params.id
            const result = await ProfileService.deleteProfile(userId, profileId)
            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}

export default new ProfileController()

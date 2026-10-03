import { NextFunction, Response } from 'express'

import ProfileService from '../services/ProfileService'
import { UnauthorizedError } from '../errors/errors'
import { IRequest } from '~/type'

class ProfileController {
    // Danh sách hồ sơ
    getProfiles = async (
        req: IRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            const profiles = await ProfileService.getProfiles(userId)

            res.json({
                data: profiles,
            })
        } catch (error) {
            next(error)
        }
    }

    // Chi tiết hồ sơ
    getProfileById = async (
        req: IRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            const profileId = req.params.id

            const profile =
                await ProfileService.getProfileById(
                    userId,
                    profileId,
                )

            res.json({
                data: profile,
            })
        } catch (error) {
            next(error)
        }
    }

    getProfileAchievements = async (req: IRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            const { profileId } = req.params

            const achievements = await ProfileService.getProfileAchievements(userId, profileId)

            res.json({
                data: achievements,
            })
        } catch (error) {
            next(error)
        }
    }

    // Tạo hồ sơ bé
    createProfile = async (
        req: IRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            const {
                display_name,
                avatar_url,
                birth_date,
            } = req.body

            if (
                !display_name ||
                !display_name.trim()
            ) {
                res.status(400).json({
                    message:
                        'Tên hiển thị không được để trống',
                })
                return
            }

            const newProfile =
                await ProfileService.createProfile(
                    userId,
                    {
                        display_name:
                            display_name.trim(),
                        avatar_url,
                        birth_date,
                    },
                )

            res.status(201).json({
                message:
                    'Tạo hồ sơ học viên thành công',
                data: newProfile,
            })
        } catch (error) {
            next(error)
        }
    }

    // Cập nhật hồ sơ
    updateProfile = async (
        req: IRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            const profileId = req.params.id

            const {
                display_name,
                avatar_url,
                birth_date,
            } = req.body

            const updatedProfile =
                await ProfileService.updateProfile(
                    userId,
                    profileId,
                    {
                        display_name,
                        avatar_url,
                        birth_date,
                    },
                )

            res.json({
                message:
                    'Cập nhật hồ sơ thành công',
                data: updatedProfile,
            })
        } catch (error) {
            next(error)
        }
    }

    // Xóa hồ sơ
    deleteProfile = async (
        req: IRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const userId = req.decoded?.sub
            if (!userId) throw new UnauthorizedError({ message: 'Token không hợp lệ hoặc đã hết hạn' })
            const profileId = req.params.id

            const result =
                await ProfileService.deleteProfile(
                    userId,
                    profileId,
                )

            res.json(result)
        } catch (error) {
            next(error)
        }
    }
}

export default new ProfileController()
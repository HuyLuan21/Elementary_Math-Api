import { QueryTypes } from 'sequelize'

import { sequelize } from '../../config/database'
import { BadRequestError, NotFoundError } from '../errors/errors'
import { Profile } from '../models'

const MAX_PROFILES_PER_USER = 5

interface ICreateProfile {
    display_name: string
    avatar_url?: string | null
    birth_date?: string | null
}

interface IUpdateProfile {
    display_name?: string
    avatar_url?: string | null
    birth_date?: string | null
}

interface IBadgeAchievement {
    id: string
    code: string
    name: string
    description: string | null
    image_url: string | null
    earned_at: Date
}

interface IStickerAchievement {
    id: string
    code: string
    name: string
    description: string | null
    image_url: string | null
    sound_url: string | null
    unlocked_at: Date
}

class ProfileService {
    async getProfiles(userId: string) {
        return await Profile.findAll({
            where: { user_id: userId },
            order: [['created_at', 'ASC']],
        })
    }

    async getProfileById(userId: string, profileId: string) {
        const profile = await Profile.findOne({
            where: { id: profileId, user_id: userId },
        })
   
        if (!profile) {
            throw new NotFoundError({ message: 'Không tìm thấy hồ sơ' })
        }

        return profile
    }

    async getProfileAchievements(userId: string, profileId: string) {
        await this.getProfileById(userId, profileId)

        const [badges, stickers] = await Promise.all([
            sequelize.query<IBadgeAchievement>(
                `SELECT b.id, b.code, b.name, b.description, b.image_url, pb.earned_at
                FROM profile_badges AS pb
                INNER JOIN badges AS b ON b.id = pb.badge_id
                WHERE pb.profile_id = :profileId
                ORDER BY pb.earned_at DESC`,
                {
                    replacements: { profileId },
                    type: QueryTypes.SELECT,
                },
            ),
            sequelize.query<IStickerAchievement>(
                `SELECT s.id, s.code, s.name, s.description, s.image_url, s.sound_url,
                    ps.unlocked_at
                FROM profile_stickers AS ps
                INNER JOIN stickers AS s ON s.id = ps.sticker_id
                WHERE ps.profile_id = :profileId
                ORDER BY s.order_index ASC`,
                {
                    replacements: { profileId },
                    type: QueryTypes.SELECT,
                },
            ),
        ])

        return {
            summary: {
                badge_count: badges.length,
                sticker_count: stickers.length,
            },
            badges,
            stickers,
        }
    }

    async createProfile(userId: string, data: ICreateProfile) {
        const currentCount = await Profile.count({
            where: { user_id: userId },
        })

        if (currentCount >= MAX_PROFILES_PER_USER) {
            throw new BadRequestError({
                message: `Tài khoản đã đạt giới hạn tối đa (${MAX_PROFILES_PER_USER} hồ sơ). Không thể tạo thêm.`,
            })
        }

        return await Profile.create({
            user_id: userId,
            display_name: data.display_name.trim(),
            avatar_url: data.avatar_url || null,
            birth_date: data.birth_date || null,
            total_stars: 0,
        })
    }

    async updateProfile(userId: string, profileId: string, data: IUpdateProfile) {
        const profile = await this.getProfileById(userId, profileId)

        return await profile.update({
            ...(data.display_name ? { display_name: data.display_name.trim() } : {}),
            ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
            ...(data.birth_date !== undefined ? { birth_date: data.birth_date } : {}),
        })
    }

    async deleteProfile(userId: string, profileId: string) {
        const profile = await this.getProfileById(userId, profileId)
        await profile.destroy()
        return { message: 'Đã xóa hồ sơ thành công' }
    }
}

export default new ProfileService()

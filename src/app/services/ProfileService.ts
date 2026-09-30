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

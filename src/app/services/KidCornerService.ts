import { Profile, Badge, Sticker, ProfileBadge, ProfileSticker, ProfileLessonProgress } from '../models'

class KidCornerService {
    async getKidCornerData(profileId: string) {
        const profile = await Profile.findByPk(profileId)
        if (!profile) {
            throw new Error('Không tìm thấy hồ sơ bé')
        }

        // 1. Lấy tất cả Badges
        const allBadges = await Badge.findAll({
            where: { is_active: true },
        })

        // Lấy danh sách badge bé đã đạt
        const userBadges = await ProfileBadge.findAll({
            where: { profile_id: profileId },
        })
        const userBadgeIds = new Set(userBadges.map((b) => b.badge_id))

        const formattedBadges = allBadges.map((b) => {
            const isAchieved = userBadgeIds.has(b.id)
            return {
                id: b.id,
                code: b.code,
                title: b.name,
                desc: b.description || '',
                imageUrl: b.image_url,
                conditionType: b.condition_type,
                conditionValue: b.condition_value,
                status: isAchieved ? 'achieved' : 'locked',
                tag: isAchieved ? 'Hoàn thành' : 'Chưa đạt',
            }
        })

        // 2. Lấy tất cả Stickers (Bạn nhỏ)
        const allStickers = await Sticker.findAll({
            where: { is_active: true },
            order: [['order_index', 'ASC']],
        })

        const userStickers = await ProfileSticker.findAll({
            where: { profile_id: profileId },
        })
        const userStickerIds = new Set(userStickers.map((s) => s.sticker_id))

        const formattedStickers = allStickers.map((s) => {
            const isUnlocked = userStickerIds.has(s.id)
            return {
                id: s.id,
                code: s.code,
                name: s.name,
                desc: s.description || '',
                imageUrl: s.image_url,
                soundUrl: s.sound_url,
                isUnlocked: isUnlocked,
            }
        })

        // 3. Thống kê bài tập đã làm
        const completedLessonsCount = await ProfileLessonProgress.count({
            where: { profile_id: profileId, status: 'completed' },
        })

        return {
            profile: {
                id: profile.id,
                name: profile.display_name,
                avatarUrl: profile.avatar_url,
                totalStars: profile.total_stars,
            },
            stats: {
                totalBadgesEarned: userBadges.length,
                totalBadgesCount: allBadges.length,
                totalStars: profile.total_stars,
                totalStickersCollected: userStickers.length,
                totalStickersCount: allStickers.length,
                completedLessons: completedLessonsCount,
            },
            badges: formattedBadges,
            stickers: formattedStickers,
        }
    }
}

export default new KidCornerService()

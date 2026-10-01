import { Chapter, Lesson, ProfileLessonProgress } from '../models'

class JourneyService {
    async getJourney(profileId?: string) {
        // Lấy tất cả chương và bài học đã publish
        const chapters = await Chapter.findAll({
            where: { is_published: true },
            order: [['order_index', 'ASC']],
            include: [
                {
                    model: Lesson,
                    as: 'lessons',
                    where: { is_published: true },
                    required: false,
                },
            ],
        })

        // Lấy tiến độ của bé nếu có profileId
        let progressMap: Record<string, { status: string; stars: number; best_score: number }> = {}
        if (profileId) {
            const progresses = await ProfileLessonProgress.findAll({
                where: { profile_id: profileId },
            })
            progresses.forEach((p) => {
                progressMap[p.lesson_id] = {
                    status: p.status,
                    stars: p.stars,
                    best_score: Number(p.best_score),
                }
            })
        }

        let isFirstLesson = true
        let hasActiveLesson = false

        // Map dữ liệu format cho frontend
        const formattedChapters = chapters.map((chap, cIdx) => {
            const chapJson = chap.toJSON()
            const sortedLessons = (chapJson.lessons || []).sort(
                (a: any, b: any) => a.order_index - b.order_index,
            )

            const formattedLessons = sortedLessons.map((les: any, lIdx: number) => {
                const prog = progressMap[les.id]
                let status = prog?.status || 'locked'
                let stars = prog?.stars || 0

                // Tự động mở bài đầu tiên nếu chưa học bài nào
                if (isFirstLesson && !prog) {
                    status = 'active'
                    hasActiveLesson = true
                } else if (status === 'unlocked' || status === 'in_progress') {
                    status = 'active'
                    hasActiveLesson = true
                }

                isFirstLesson = false

                return {
                    id: les.id,
                    chapterId: chap.id,
                    chapterTitle: chap.title,
                    chapterDesc: chap.description || '',
                    title: les.title,
                    desc: les.description || '',
                    orderIndex: les.order_index,
                    status: status, // 'completed' | 'active' | 'locked'
                    stars: stars,
                    score: prog?.best_score ? `${prog.best_score}/10` : '',
                    xp: 20 + les.order_index * 5,
                    type: les.order_index === sortedLessons.length ? 'trophy' : 'lesson',
                    rewardStickerId: les.reward_sticker_id,
                }
            })

            return {
                id: chap.id,
                title: chap.title,
                desc: chap.description || '',
                orderIndex: chap.order_index,
                coverUrl: chap.cover_url,
                levels: formattedLessons,
            }
        })

        return formattedChapters
    }
}

export default new JourneyService()

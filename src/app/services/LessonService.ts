import { Lesson, Question, ProfileLessonProgress, Profile, Sticker } from '../models'

const LABEL_TRANSLATIONS: Record<string, string> = {
    red: 'Màu đỏ 🔴',
    blue: 'Màu xanh dương 🔵',
    yellow: 'Màu vàng 🟡',
    green: 'Màu xanh lá 🟢',
    circle: 'Hình tròn ⭕',
    square: 'Hình vuông 🔲',
    triangle: 'Hình tam giác 🔺',
    rectangle: 'Hình chữ nhật ▭',
    left: 'Bên trái 👈',
    right: 'Bên phải 👉',
    equal: 'Bằng nhau =',
    not_equal: 'Không bằng nhau ≠',
    elephant: 'Chú voi 🐘',
    cat: 'Chú mèo 🐱',
    brush_teeth: 'Đánh răng 🪥',
    sleep: 'Đi ngủ 😴',
    watch_stars: 'Ngắm sao ✨',
    lunch: 'Ăn trưa 🍱',
    sleep_at_night: 'Ngủ ban đêm 🌙',
    wake_up: 'Thức dậy ⏰',
    go_to_school: 'Đi học 🎒',
    have_breakfast: 'Ăn sáng 🥞',
    breakfast: 'Ăn sáng 🥞',
}

const EMOJI_MAP: Record<string, string> = {
    apple: '🍎',
    ball: '⚽',
    cat: '🐱',
    fish: '🐟',
    star: '⭐',
    toy: '🧸',
    elephant: '🐘',
}

class LessonService {
    async getLessonDetailWithQuestions(lessonId: string) {
        const lesson = await Lesson.findByPk(lessonId, {
            include: [
                {
                    model: Question,
                    as: 'questions',
                },
                {
                    model: Sticker,
                    as: 'rewardSticker',
                },
            ],
        })

        if (!lesson) {
            throw new Error('Không tìm thấy bài học')
        }

        const lessonJson = lesson.toJSON()
        const sortedQuestions = (lessonJson.questions || []).sort(
            (a: any, b: any) => a.order_index - b.order_index,
        )

        const formattedQuestions = sortedQuestions.map((q: any) => {
            let content = q.content_json
            if (typeof content === 'string') {
                try { content = JSON.parse(content) } catch (e) {}
            }

            let rawOptions = q.options_json
            if (typeof rawOptions === 'string') {
                try { rawOptions = JSON.parse(rawOptions) } catch (e) {}
            }

            // Chuẩn hóa Options thành format { id, label }
            let formattedOptions: Array<{ id: string; label: string; icon?: string }> = []
            if (Array.isArray(rawOptions)) {
                formattedOptions = rawOptions.map((opt: any) => {
                    if (typeof opt === 'string' || typeof opt === 'number') {
                        const optKey = String(opt)
                        return {
                            id: optKey,
                            label: LABEL_TRANSLATIONS[optKey] || `${optKey}`,
                        }
                    }
                    return opt
                })
            }

            // Chuẩn hóa Visual Items
            let visualItems: string[] = []
            if (content?.visual_items && Array.isArray(content.visual_items)) {
                visualItems = content.visual_items
            } else if (content?.item && content?.count) {
                const emoji = EMOJI_MAP[content.item] || '⭐'
                visualItems = Array(Number(content.count) || 1).fill(emoji)
            } else if (content?.image) {
                if (content.image.includes('apple-red')) visualItems = ['🍎']
            }

            // Chuẩn hóa So sánh (Compare)
            let compareLeft = null
            let compareRight = null
            if (content?.left !== undefined && content?.right !== undefined) {
                const itemEmoji = EMOJI_MAP[content.item] || (typeof content.left === 'string' ? EMOJI_MAP[content.left] || '🍎' : '🍎')
                const rightEmoji = typeof content.right === 'string' ? EMOJI_MAP[content.right] || itemEmoji : itemEmoji

                compareLeft = {
                    count: typeof content.left === 'number' ? content.left : 1,
                    icon: itemEmoji,
                    label: typeof content.left === 'string' ? LABEL_TRANSLATIONS[content.left] || content.left : `${content.left}`,
                }
                compareRight = {
                    count: typeof content.right === 'number' ? content.right : 1,
                    icon: rightEmoji,
                    label: typeof content.right === 'string' ? LABEL_TRANSLATIONS[content.right] || content.right : `${content.right}`,
                }
            }

            let type: 'count' | 'equation' | 'compare' = 'count'
            if (q.question_type === 'comparison') type = 'compare'
            else if (q.question_type === 'counting') type = 'count'

            return {
                id: q.id,
                type,
                questionText: q.question_text || 'Bé hãy chọn đáp án đúng:',
                visualItems,
                visualFormula: content?.visual_formula || null,
                compareLeft,
                compareRight,
                options: formattedOptions,
                correctAnswerId: String(q.correct_answer || ''),
                explanation: `Đáp án chính xác là: ${LABEL_TRANSLATIONS[q.correct_answer] || q.correct_answer}`,
                skillTag: q.skill_tag,
            }
        })

        return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            rewardSticker: lessonJson.rewardSticker,
            questions: formattedQuestions,
        }
    }

    async submitLesson(profileId: string, lessonId: string, correctCount: number, totalQuestions: number) {
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0
        let starsEarned = 1
        if (score >= 8.0) starsEarned = 3
        else if (score >= 5.0) starsEarned = 2

        const now = new Date()

        // Tìm hoặc tạo tiến độ bài học
        const [progress, created] = await ProfileLessonProgress.findOrCreate({
            where: { profile_id: profileId, lesson_id: lessonId },
            defaults: {
                profile_id: profileId,
                lesson_id: lessonId,
                status: 'completed',
                stars: starsEarned,
                best_score: score,
                attempts_count: 1,
                first_completed_at: now,
                last_played_at: now,
            },
        })

        if (!created) {
            const newStars = Math.max(progress.stars, starsEarned)
            const newBestScore = Math.max(Number(progress.best_score), score)

            await progress.update({
                status: 'completed',
                stars: newStars,
                best_score: newBestScore,
                attempts_count: progress.attempts_count + 1,
                last_played_at: now,
                first_completed_at: progress.first_completed_at || now,
            })
        }

        // Cập nhật tổng sao của Profile
        const allProgress = await ProfileLessonProgress.findAll({
            where: { profile_id: profileId, status: 'completed' },
        })
        const totalStars = allProgress.reduce((sum, p) => sum + p.stars, 0)
        await Profile.update({ total_stars: totalStars }, { where: { id: profileId } })

        // Tự động mở khóa bài học tiếp theo
        const currentLesson = await Lesson.findByPk(lessonId)
        if (currentLesson) {
            const nextLesson = await Lesson.findOne({
                where: {
                    chapter_id: currentLesson.chapter_id,
                    order_index: currentLesson.order_index + 1,
                    is_published: true,
                },
            })

            if (nextLesson) {
                const nextProgress = await ProfileLessonProgress.findOne({
                    where: { profile_id: profileId, lesson_id: nextLesson.id },
                })
                if (!nextProgress || nextProgress.status === 'locked') {
                    await ProfileLessonProgress.upsert({
                        profile_id: profileId,
                        lesson_id: nextLesson.id,
                        status: 'unlocked',
                        stars: 0,
                        best_score: 0,
                        attempts_count: 0,
                    })
                }
            }
        }

        return {
            score,
            starsEarned,
            totalStars,
            correctCount,
            totalQuestions,
        }
    }
}

export default new LessonService()

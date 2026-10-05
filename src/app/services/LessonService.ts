import {
    Badge,
    Chapter,
    Lesson,
    Profile,
    ProfileBadge,
    ProfileLessonProgress,
    Question,
    Sticker,
} from '../models'

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
    // Helper phân giải ID bài học (hỗ trợ cả UUID lẫn số thứ tự '1', '2', ...)
    async resolveLesson(rawId: string): Promise<{ lesson: Lesson | null; allLessons: Lesson[]; index: number }> {
        const allChapters = await Chapter.findAll({
            where: { is_published: true },
            order: [['order_index', 'ASC']],
            include: [
                {
                    model: Lesson,
                    as: 'lessons',
                    where: { is_published: true },
                    required: true,
                },
            ],
        })

        const allLessons: Lesson[] = []
        for (const chap of allChapters) {
            const sortedLessons = ((chap as any).lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
            allLessons.push(...sortedLessons)
        }

        // 1. Tìm bằng UUID chính xác
        let index = allLessons.findIndex((l) => l.id === rawId)
        if (index !== -1) {
            return { lesson: allLessons[index], allLessons, index }
        }

        // 2. Tìm bằng số thứ tự (ví dụ: '1', '2', '3')
        const num = Number(rawId)
        if (!isNaN(num) && num >= 1 && num <= allLessons.length) {
            index = num - 1
            return { lesson: allLessons[index], allLessons, index }
        }

        // 3. Tìm bằng Lesson.findByPk
        const directLesson = await Lesson.findByPk(rawId)
        if (directLesson) {
            index = allLessons.findIndex((l) => l.id === directLesson.id)
            return { lesson: directLesson, allLessons, index }
        }

        return { lesson: null, allLessons, index: -1 }
    }

    // 1. Kiểm tra bài học có được phép truy cập hay không
    async isLessonUnlocked(
        lessonId: string,
        profileId?: string,
    ): Promise<{ isUnlocked: boolean; reason?: string; lesson?: Lesson }> {
        const { lesson, allLessons, index: currIndex } = await this.resolveLesson(lessonId)
        if (!lesson || currIndex === -1) {
            return { isUnlocked: false, reason: 'Không tìm thấy bài học trong chương trình học' }
        }

        // Nếu là bài đầu tiên của chương trình -> Luôn mở khóa
        if (currIndex === 0) {
            return { isUnlocked: true, lesson }
        }

        // Nếu không có profileId, lấy profile mặc định của hệ thống
        if (!profileId) {
            const defaultProfile = await Profile.findOne({
                order: [['created_at', 'ASC']],
            })
            if (defaultProfile) {
                profileId = defaultProfile.id
            } else {
                const prevLesson = allLessons[currIndex - 1]
                return {
                    isUnlocked: false,
                    reason: `Bài học đang bị khóa 🔒. Bé hãy hoàn thành bài trước "${prevLesson.title}" để mở khóa nhé!`,
                }
            }
        }

        // B. Nếu bài này đã có record completed, unlocked, hoặc in_progress thì cho phép
        const currentProgress = await ProfileLessonProgress.findOne({
            where: { profile_id: profileId, lesson_id: lesson.id },
        })

        if (
            currentProgress &&
            (currentProgress.status === 'completed' ||
                currentProgress.status === 'unlocked' ||
                currentProgress.status === 'in_progress')
        ) {
            return { isUnlocked: true, lesson }
        }

        // C. Kiểm tra bài học ngay trước đó trong chuỗi bài học
        const prevLesson = allLessons[currIndex - 1]
        const prevProgress = await ProfileLessonProgress.findOne({
            where: { profile_id: profileId, lesson_id: prevLesson.id, status: 'completed' },
        })

        if (prevProgress) {
            // Tự động mở khóa bài này
            await ProfileLessonProgress.findOrCreate({
                where: { profile_id: profileId, lesson_id: lesson.id },
                defaults: {
                    profile_id: profileId,
                    lesson_id: lesson.id,
                    status: 'unlocked',
                    stars: 0,
                    best_score: 0,
                    attempts_count: 0,
                },
            })
            return { isUnlocked: true, lesson }
        }

        return {
            isUnlocked: false,
            reason: `Bài học đang bị khóa 🔒. Bé hãy hoàn thành bài trước "${prevLesson.title}" để mở khóa nhé!`,
        }
    }

    async getLessonDetailWithQuestions(lessonId: string, profileId?: string) {
        // Luôn kiểm tra quyền mở khóa
        const unlockCheck = await this.isLessonUnlocked(lessonId, profileId)
        if (!unlockCheck.isUnlocked) {
            const err: any = new Error(unlockCheck.reason || 'Bài học đang bị khóa')
            err.status = 403
            err.isLocked = true
            throw err
        }

        const targetLesson = unlockCheck.lesson || (await this.resolveLesson(lessonId)).lesson
        if (!targetLesson) {
            throw new Error('Không tìm thấy bài học')
        }

        const lesson = await Lesson.findByPk(targetLesson.id, {
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

        const lessonJson: any = lesson.toJSON()
        const sortedQuestions = (lessonJson.questions || []).sort((a: any, b: any) => a.order_index - b.order_index)

        const formattedQuestions = sortedQuestions.map((q: any) => {
            let content = q.content_json
            if (typeof content === 'string') {
                try {
                    content = JSON.parse(content)
                } catch (_e) {
                    // Ignore parse error
                }
            }

            let rawOptions = q.options_json
            if (typeof rawOptions === 'string') {
                try {
                    rawOptions = JSON.parse(rawOptions)
                } catch (_e) {
                    // Ignore parse error
                }
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
                const itemEmoji =
                    EMOJI_MAP[content.item] ||
                    (typeof content.left === 'string' ? EMOJI_MAP[content.left] || '🍎' : '🍎')
                const rightEmoji = typeof content.right === 'string' ? EMOJI_MAP[content.right] || itemEmoji : itemEmoji

                compareLeft = {
                    count: typeof content.left === 'number' ? content.left : 1,
                    icon: itemEmoji,
                    label:
                        typeof content.left === 'string'
                            ? LABEL_TRANSLATIONS[content.left] || content.left
                            : `${content.left}`,
                }
                compareRight = {
                    count: typeof content.right === 'number' ? content.right : 1,
                    icon: rightEmoji,
                    label:
                        typeof content.right === 'string'
                            ? LABEL_TRANSLATIONS[content.right] || content.right
                            : `${content.right}`,
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
        // Kiểm tra quyền nộp bài
        const unlockCheck = await this.isLessonUnlocked(lessonId, profileId)
        if (!unlockCheck.isUnlocked) {
            const err: any = new Error(unlockCheck.reason || 'Không thể nộp bài vì bài học đang bị khóa')
            err.status = 403
            err.isLocked = true
            throw err
        }

        const targetLesson = unlockCheck.lesson || (await this.resolveLesson(lessonId)).lesson
        const realLessonId = targetLesson ? targetLesson.id : lessonId

        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0
        let starsEarned = 0
        if (score >= 8.0) starsEarned = 3
        else if (score >= 5.0) starsEarned = 2
        else if (score >= 2.0) starsEarned = 1
        else starsEarned = 0

        const now = new Date()

        // Tìm hoặc tạo tiến độ bài học với realLessonId
        const [progress, created] = await ProfileLessonProgress.findOrCreate({
            where: { profile_id: profileId, lesson_id: realLessonId },
            defaults: {
                profile_id: profileId,
                lesson_id: realLessonId,
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

        // Tự động mở khóa bài học tiếp theo (xuyên suốt các chương)
        const allChapters = await Chapter.findAll({
            where: { is_published: true },
            order: [['order_index', 'ASC']],
            include: [
                {
                    model: Lesson,
                    as: 'lessons',
                    where: { is_published: true },
                    required: true,
                },
            ],
        })

        const allLessonsSequence: Lesson[] = []
        for (const chap of allChapters) {
            const sortedLessons = ((chap as any).lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
            allLessonsSequence.push(...sortedLessons)
        }

        const currIndex = allLessonsSequence.findIndex((l) => l.id === realLessonId)
        if (currIndex !== -1 && currIndex + 1 < allLessonsSequence.length) {
            const nextLesson = allLessonsSequence[currIndex + 1]
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

        // Tự động trao Huy hiệu (Badges)
        // 1. Huy hiệu bài học đầu tiên (FIRST_LESSON)
        if (allProgress.length >= 1) {
            const firstBadge = await Badge.findOne({ where: { condition_type: 'first_lesson', is_active: true } })
            if (firstBadge) {
                await ProfileBadge.findOrCreate({
                    where: { profile_id: profileId, badge_id: firstBadge.id },
                    defaults: {
                        profile_id: profileId,
                        badge_id: firstBadge.id,
                        earned_at: now,
                        is_seen: false,
                    },
                })
            }
        }

        // 2. Huy hiệu hoàn thành 10 bài học (TEN_LESSONS)
        if (allProgress.length >= 10) {
            const tenBadge = await Badge.findOne({
                where: { condition_type: 'lessons_completed', condition_value: 10, is_active: true },
            })
            if (tenBadge) {
                await ProfileBadge.findOrCreate({
                    where: { profile_id: profileId, badge_id: tenBadge.id },
                    defaults: {
                        profile_id: profileId,
                        badge_id: tenBadge.id,
                        earned_at: now,
                        is_seen: false,
                    },
                })
            }
        }

        // 3. Huy hiệu hoàn thành từng chặng/chương (CHAPTER_COMPLETED)
        if (targetLesson && targetLesson.chapter_id) {
            const chapterLessons = await Lesson.findAll({
                where: { chapter_id: targetLesson.chapter_id, is_published: true },
            })
            const chapterLessonIds = chapterLessons.map((l) => l.id)
            const completedInChapter = await ProfileLessonProgress.count({
                where: {
                    profile_id: profileId,
                    lesson_id: chapterLessonIds,
                    status: 'completed',
                },
            })

            if (completedInChapter === chapterLessons.length && chapterLessons.length > 0) {
                const currentChapter = await Chapter.findByPk(targetLesson.chapter_id)
                if (currentChapter && currentChapter.reward_badge_id) {
                    await ProfileBadge.findOrCreate({
                        where: { profile_id: profileId, badge_id: currentChapter.reward_badge_id },
                        defaults: {
                            profile_id: profileId,
                            badge_id: currentChapter.reward_badge_id,
                            earned_at: now,
                            is_seen: false,
                        },
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

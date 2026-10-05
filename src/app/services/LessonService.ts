import {
    Badge,
    Chapter,
    Lesson,
    Profile,
    ProfileBadge,
    ProfileLessonProgress,
    ProfileSticker,
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

const COLOR_MAP: Record<string, { name: string; hex: string; emoji: string }> = {
    red: { name: 'Màu đỏ', hex: '#EF4444', emoji: '🔴' },
    blue: { name: 'Màu xanh dương', hex: '#3B82F6', emoji: '🔵' },
    yellow: { name: 'Màu vàng', hex: '#F59E0B', emoji: '🟡' },
    green: { name: 'Màu xanh lá', hex: '#10B981', emoji: '🟢' },
}

const SHAPE_MAP: Record<
    string,
    { name: string; shape: 'circle' | 'square' | 'triangle' | 'rectangle'; emoji: string; color: string }
> = {
    circle: { name: 'Hình tròn', shape: 'circle', emoji: '⭕', color: '#38BDF8' },
    square: { name: 'Hình vuông', shape: 'square', emoji: '🔲', color: '#FBBF24' },
    triangle: { name: 'Hình tam giác', shape: 'triangle', emoji: '🔺', color: '#F87171' },
    rectangle: { name: 'Hình chữ nhật', shape: 'rectangle', emoji: '▭', color: '#A78BFA' },
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
                } catch (_) {
                    // Ignore parse error
                }
            }

            let rawOptions = q.options_json
            if (typeof rawOptions === 'string') {
                try {
                    rawOptions = JSON.parse(rawOptions)
                } catch (_) {
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

                const leftCount = typeof content.left === 'number' ? content.left : 1
                const rightCount = typeof content.right === 'number' ? content.right : 1

                compareLeft = {
                    count: leftCount,
                    icon: itemEmoji,
                    items: typeof content.left === 'number' ? Array(leftCount).fill(itemEmoji) : [itemEmoji],
                    label:
                        typeof content.left === 'string'
                            ? LABEL_TRANSLATIONS[content.left] || content.left
                            : `${leftCount}`,
                }
                compareRight = {
                    count: rightCount,
                    icon: rightEmoji,
                    items: typeof content.right === 'number' ? Array(rightCount).fill(rightEmoji) : [rightEmoji],
                    label:
                        typeof content.right === 'string'
                            ? LABEL_TRANSLATIONS[content.right] || content.right
                            : `${rightCount}`,
                }
            }

            let numberedCards: Array<{
                index: number
                label: string
                color: string
                name?: string
                shape?: 'circle' | 'square' | 'triangle' | 'rectangle'
                emoji?: string
            }> | null = null

            let clockTime: { hour: number; minute: number } | null = null

            let type: 'count' | 'equation' | 'compare' | 'color_choice' | 'shape_choice' | 'time' | 'image_choice' =
                'count'
            let correctAnswerId = String(q.correct_answer || '')
            let explanation = `Đáp án chính xác là: ${LABEL_TRANSLATIONS[q.correct_answer] || q.correct_answer}`

            const textLower = (q.question_text || '').toLowerCase()
            const isObjectColorQuestion =
                content?.image ||
                textLower.includes('quả táo') ||
                textLower.includes('mặt trời') ||
                textLower.includes('lá cây') ||
                textLower.includes('bầu trời')

            if (q.question_type === 'color_choice' || q.skill_tag === 'color') {
                type = 'color_choice'
                if (isObjectColorQuestion) {
                    // 1. Nhận biết màu sắc của đồ vật cụ thể (Quả táo, mặt trời, lá cây...)
                    let objectEmoji = '🍎'
                    if (textLower.includes('mặt trời')) objectEmoji = '☀️'
                    else if (textLower.includes('lá cây')) objectEmoji = '🍃'
                    else if (textLower.includes('bầu trời')) objectEmoji = '☁️'
                    else if (content?.image?.includes('apple')) objectEmoji = '🍎'

                    visualItems = [objectEmoji]
                    numberedCards = null
                    correctAnswerId = String(q.correct_answer || 'red')
                    formattedOptions = (rawOptions || []).map((opt: string) => ({
                        id: String(opt),
                        label: LABEL_TRANSLATIONS[opt] || opt,
                        icon: COLOR_MAP[opt]?.emoji || '🎨',
                    }))
                    explanation = `Đồ vật/quả này có ${LABEL_TRANSLATIONS[q.correct_answer] || q.correct_answer}`
                } else {
                    // 2. Chọn hình có màu sắc theo yêu cầu ("Màu đỏ là màu nào?", "Hình nào có màu xanh?")
                    if (
                        Array.isArray(rawOptions) &&
                        rawOptions.length > 0 &&
                        typeof rawOptions[0] === 'string' &&
                        COLOR_MAP[rawOptions[0]]
                    ) {
                        numberedCards = rawOptions.map((colorKey: string, idx: number) => {
                            const colorInfo = COLOR_MAP[colorKey] || { name: colorKey, hex: '#4DA8DA', emoji: '🎨' }
                            return {
                                index: idx + 1,
                                label: `Hình ${idx + 1}`,
                                color: colorInfo.hex,
                                name: colorInfo.name,
                                shape: (idx % 2 === 0 ? 'circle' : 'square') as 'circle' | 'square',
                                emoji: colorInfo.emoji,
                            }
                        })

                        const correctIdx = rawOptions.findIndex(
                            (opt: string) => String(opt).toLowerCase() === String(q.correct_answer).toLowerCase(),
                        )
                        if (correctIdx !== -1) {
                            correctAnswerId = String(correctIdx + 1)
                            explanation = `Đáp án đúng là Hình ${correctAnswerId} (${LABEL_TRANSLATIONS[q.correct_answer] || q.correct_answer})`
                        }

                        formattedOptions = rawOptions.map((_opt: string, idx: number) => ({
                            id: String(idx + 1),
                            label: `Hình ${idx + 1}`,
                        }))
                    }
                }
            } else if (q.question_type === 'shape_choice' || q.skill_tag === 'shape') {
                type = 'shape_choice'
                if (
                    Array.isArray(rawOptions) &&
                    rawOptions.length > 0 &&
                    typeof rawOptions[0] === 'string' &&
                    SHAPE_MAP[rawOptions[0]]
                ) {
                    numberedCards = rawOptions.map((shapeKey: string, idx: number) => {
                        const shapeInfo = SHAPE_MAP[shapeKey] || {
                            name: shapeKey,
                            shape: 'circle',
                            emoji: '📐',
                            color: '#4DA8DA',
                        }
                        return {
                            index: idx + 1,
                            label: `Hình ${idx + 1}`,
                            color: shapeInfo.color,
                            name: shapeInfo.name,
                            shape: shapeInfo.shape,
                            emoji: shapeInfo.emoji,
                        }
                    })

                    const correctIdx = rawOptions.findIndex(
                        (opt: string) => String(opt).toLowerCase() === String(q.correct_answer).toLowerCase(),
                    )
                    if (correctIdx !== -1) {
                        correctAnswerId = String(correctIdx + 1)
                        explanation = `Đáp án đúng là Hình ${correctAnswerId} (${LABEL_TRANSLATIONS[q.correct_answer] || q.correct_answer})`
                    }

                    formattedOptions = rawOptions.map((_opt: string, idx: number) => ({
                        id: String(idx + 1),
                        label: `Hình ${idx + 1}`,
                    }))
                }
            } else if (q.question_type === 'time' || content?.hour !== undefined || q.skill_tag === 'time') {
                if (content?.hour !== undefined || String(q.correct_answer).includes(':')) {
                    type = 'time'
                    let hour = content?.hour
                    if (hour === undefined && typeof q.correct_answer === 'string') {
                        const match = q.correct_answer.match(/(\d+)/)
                        if (match) hour = parseInt(match[1], 10)
                    }
                    clockTime = {
                        hour: Number(hour || 3),
                        minute: Number(content?.minute || 0),
                    }
                    correctAnswerId = String(q.correct_answer || '3:00')
                    explanation = `Kim đồng hồ đang chỉ ${correctAnswerId}`
                } else {
                    type = 'image_choice'
                }
            } else if (q.question_type === 'comparison') {
                type = 'compare'
            } else if (q.question_type === 'counting') {
                type = 'count'
            }

            return {
                id: q.id,
                type,
                questionText: q.question_text || 'Bé hãy chọn đáp án đúng:',
                visualItems,
                visualFormula: content?.visual_formula || null,
                compareLeft,
                compareRight,
                numberedCards,
                clockTime,
                options: formattedOptions,
                correctAnswerId,
                explanation,
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

        // 4. Huy hiệu chuỗi ngày học liên tục (STREAK BADGES)
        const uniqueLearningDates = new Set<string>()
        for (const p of allProgress) {
            const dateVal = p.last_played_at || p.first_completed_at || (p as any).updated_at
            if (dateVal) {
                const d = new Date(dateVal)
                const yyyyMmDd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                uniqueLearningDates.add(yyyyMmDd)
            }
        }

        // Tính chuỗi ngày liên tiếp lùi từ hôm nay
        let streakDays = 0
        const checkDate = new Date(now)
        while (true) {
            const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
            if (uniqueLearningDates.has(checkStr)) {
                streakDays++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        if (streakDays > 0) {
            const streakBadges = await Badge.findAll({
                where: {
                    condition_type: 'streak',
                    is_active: true,
                },
            })

            for (const sBadge of streakBadges) {
                const reqStreak = sBadge.condition_value || 1
                if (streakDays >= reqStreak) {
                    await ProfileBadge.findOrCreate({
                        where: { profile_id: profileId, badge_id: sBadge.id },
                        defaults: {
                            profile_id: profileId,
                            badge_id: sBadge.id,
                            earned_at: now,
                            is_seen: false,
                        },
                    })
                }
            }
        }

        // 4. Tự động trao Sticker khi hoàn thành xuất sắc bài học (3 sao)
        let awardedSticker: {
            id: string
            code: string
            name: string
            description: string | null
            image_url: string | null
            isNew: boolean
        } | null = null

        if (starsEarned === 3) {
            let stickerId: string | null | undefined = targetLesson ? (targetLesson as any).reward_sticker_id : null
            if (!stickerId) {
                const allStickers = await Sticker.findAll({
                    where: { is_active: true },
                    order: [['order_index', 'ASC']],
                })
                if (allStickers.length > 0) {
                    const fallbackIndex = Math.min(currIndex >= 0 ? currIndex : 0, allStickers.length - 1)
                    stickerId = allStickers[fallbackIndex].id
                }
            }

            if (stickerId) {
                const [_, isNew] = await ProfileSticker.findOrCreate({
                    where: { profile_id: profileId, sticker_id: stickerId },
                    defaults: {
                        profile_id: profileId,
                        sticker_id: stickerId,
                        unlocked_at: now,
                        is_seen: false,
                    },
                })

                const stickerInfo = await Sticker.findByPk(stickerId)
                if (stickerInfo) {
                    awardedSticker = {
                        id: stickerInfo.id,
                        code: stickerInfo.code,
                        name: stickerInfo.name,
                        description: stickerInfo.description,
                        image_url: stickerInfo.image_url,
                        isNew: isNew,
                    }
                }
            }
        }

        return {
            score,
            starsEarned,
            totalStars,
            correctCount,
            totalQuestions,
            awardedSticker,
        }
    }
}

export default new LessonService()

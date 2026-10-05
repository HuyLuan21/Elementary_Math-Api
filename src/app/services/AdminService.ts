import { Op } from 'sequelize'

import { Badge, Chapter, Lesson, Profile, ProfileBadge, ProfileLessonProgress, Question, User } from '../models'

class AdminService {
    async getMetrics() {
        const [
            totalParents,
            totalChildren,
            totalChapters,
            totalLessons,
            totalQuestions,
            totalBadges,
            completedLessonsTotal,
        ] = await Promise.all([
            User.count({ where: { role: 'parent' } }),
            Profile.count(),
            Chapter.count(),
            Lesson.count(),
            Question.count(),
            Badge.count(),
            ProfileLessonProgress.count({ where: { status: 'completed' } }),
        ])

        // Số bé hoạt động trong ngày hôm nay (tính từ đầu ngày UTC)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const activeToday = await ProfileLessonProgress.count({
            where: {
                last_played_at: {
                    [Op.gte]: today,
                },
            },
            distinct: true,
            col: 'profile_id',
        })

        return {
            totalParents,
            totalChildren,
            totalChapters,
            totalLessons,
            totalQuestions,
            totalBadges,
            activeToday,
            completedLessonsTotal,
        }
    }

    async getAccounts() {
        const users = await User.findAll({
            where: { role: 'parent' },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Profile,
                    as: 'profiles',
                },
            ],
        })

        const result = []

        for (const u of users) {
            const userJson = u.toJSON() as any
            const profilesList = []
            const AVATAR_FALLBACK_ICONS = ['🦁', '🦄', '🐼', '🐶', '🐱', '🦊', '🐯', '🐰']
            const AVATAR_MAP: Record<string, string> = {
                '/avatars/bunny.png': '🐰',
                '/avatars/cat.png': '🐱',
                '/avatars/lion.png': '🦁',
                '/avatars/unicorn.png': '🦄',
                '/avatars/panda.png': '🐼',
                '/avatars/dog.png': '🐶',
                '/avatars/fox.png': '🦊',
                '/avatars/tiger.png': '🐯',
            }

            const rawProfiles = userJson.profiles || []
            for (let i = 0; i < rawProfiles.length; i++) {
                const p = rawProfiles[i]
                const [completedCount, badgeCount, lastProgress] = await Promise.all([
                    ProfileLessonProgress.count({
                        where: { profile_id: p.id, status: 'completed' },
                    }),
                    ProfileBadge.count({
                        where: { profile_id: p.id },
                    }),
                    ProfileLessonProgress.findOne({
                        where: { profile_id: p.id },
                        order: [['last_played_at', 'DESC']],
                    }),
                ])

                const resolvedAvatar =
                    p.avatar_url && AVATAR_FALLBACK_ICONS.includes(p.avatar_url)
                        ? p.avatar_url
                        : p.avatar_url && AVATAR_MAP[p.avatar_url]
                          ? AVATAR_MAP[p.avatar_url]
                          : p.avatar_url && (p.avatar_url.startsWith('http') || p.avatar_url.startsWith('data:'))
                            ? p.avatar_url
                            : AVATAR_FALLBACK_ICONS[i % AVATAR_FALLBACK_ICONS.length]

                profilesList.push({
                    id: p.id,
                    displayName: p.display_name,
                    avatarIcon: resolvedAvatar,
                    grade: 1, // mặc định hoặc tính theo độ tuổi
                    birthDate: p.birth_date,
                    totalStars: p.total_stars || 0,
                    completedLessons: completedCount,
                    learningDays: Math.ceil(completedCount / 2) || 1,
                    badgeCount: badgeCount,
                    lastActiveAt: lastProgress?.last_played_at || p.created_at,
                })
            }

            result.push({
                id: u.id,
                email: u.email,
                name: u.full_name || u.email.split('@')[0],
                createdAt: u.created_at,
                status: (u.status === 'locked' ? 'suspended' : 'active') as 'active' | 'suspended',
                hasPin: Boolean(u.pin_enabled || u.pin_hash),
                profiles: profilesList,
            })
        }

        return result
    }

    async toggleAccountStatus(userId: string) {
        const user = await User.findByPk(userId)
        if (!user) throw new Error('Không tìm thấy người dùng')

        const newStatus = user.status === 'locked' ? 'active' : 'locked'
        await user.update({ status: newStatus })

        return {
            id: user.id,
            email: user.email,
            name: user.full_name || user.email.split('@')[0],
            createdAt: user.created_at,
            status: (newStatus === 'locked' ? 'suspended' : 'active') as 'active' | 'suspended',
            hasPin: Boolean(user.pin_enabled || user.pin_hash),
        }
    }

    async resetUserPin(userId: string) {
        const user = await User.findByPk(userId)
        if (!user) throw new Error('Không tìm thấy người dùng')

        await user.update({
            pin_enabled: false,
            pin_hash: null,
        })
    }

    async deleteAccount(userId: string) {
        const user = await User.findByPk(userId)
        if (!user) throw new Error('Không tìm thấy người dùng')

        await user.destroy()
    }

    async getChapters() {
        const chapters = await Chapter.findAll({
            order: [['order_index', 'ASC']],
            include: [
                {
                    model: Lesson,
                    as: 'lessons',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            order: [['order_index', 'ASC']],
                        },
                    ],
                },
            ],
        })

        return chapters.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description || '',
            grade: 1,
            orderNumber: c.order_index,
            status: (c.is_published ? 'published' : 'draft') as 'published' | 'draft',
            lessons: (c.lessons || []).map((l: any) => ({
                id: l.id,
                chapterId: l.chapter_id,
                title: l.title,
                description: l.description || '',
                orderNumber: l.order_index,
                grade: 1,
                icon: '📝',
                rewardStars: 3,
                status: (l.is_published ? 'published' : 'draft') as 'published' | 'draft',
                questionCount: l.questions ? l.questions.length : 0,
                questions: (l.questions || []).map((q: any) => ({
                    id: q.id,
                    lessonId: q.lesson_id,
                    orderNumber: q.order_index,
                    questionText: q.question_text || '',
                    questionType: q.question_type || 'multiple_choice',
                    options: Array.isArray(q.options_json)
                        ? q.options_json
                        : typeof q.options_json === 'string'
                          ? JSON.parse(q.options_json)
                          : [],
                    correctAnswer: q.correct_answer || '',
                    points: 10,
                })),
            })),
        }))
    }

    async saveChapter(data: any) {
        if (data.id) {
            const chapter = await Chapter.findByPk(data.id)
            if (chapter) {
                await chapter.update({
                    title: data.title || chapter.title,
                    description: data.description !== undefined ? data.description : chapter.description,
                    is_published: data.status ? data.status === 'published' : chapter.is_published,
                })
                return chapter
            }
        }

        const count = await Chapter.count()
        const newChapter = await Chapter.create({
            title: data.title,
            description: data.description || null,
            order_index: count + 1,
            is_published: data.status ? data.status === 'published' : true,
        })

        return newChapter
    }

    async deleteChapter(chapterId: string) {
        const chapter = await Chapter.findByPk(chapterId)
        if (!chapter) throw new Error('Không tìm thấy chương')
        await chapter.destroy()
    }

    async saveLesson(chapterId: string, data: any) {
        if (data.id) {
            const lesson = await Lesson.findByPk(data.id)
            if (lesson) {
                await lesson.update({
                    title: data.title || lesson.title,
                    description: data.description !== undefined ? data.description : lesson.description,
                    is_published: data.status ? data.status === 'published' : lesson.is_published,
                })
                return lesson
            }
        }

        const count = await Lesson.count({ where: { chapter_id: chapterId } })
        const newLesson = await Lesson.create({
            chapter_id: chapterId,
            title: data.title,
            description: data.description || null,
            order_index: count + 1,
            is_published: data.status ? data.status === 'published' : true,
        })

        return newLesson
    }

    async deleteLesson(lessonId: string) {
        const lesson = await Lesson.findByPk(lessonId)
        if (!lesson) throw new Error('Không tìm thấy bài học')
        await lesson.destroy()
    }

    async saveQuestion(lessonId: string, data: any) {
        if (data.id) {
            const q = await Question.findByPk(data.id)
            if (q) {
                await q.update({
                    question_text: data.questionText || q.question_text,
                    question_type: data.questionType || q.question_type,
                    options_json: data.options || q.options_json,
                    correct_answer: data.correctAnswer || q.correct_answer,
                })
                return q
            }
        }

        const count = await Question.count({ where: { lesson_id: lessonId } })
        const newQ = await Question.create({
            lesson_id: lessonId,
            question_type: data.questionType || 'multiple_choice',
            question_text: data.questionText || 'Câu hỏi mới',
            options_json: data.options || ['1', '2', '3', '4'],
            correct_answer: data.correctAnswer || '1',
            order_index: count + 1,
        })

        return newQ
    }

    async deleteQuestion(questionId: string) {
        const q = await Question.findByPk(questionId)
        if (!q) throw new Error('Không tìm thấy câu hỏi')
        await q.destroy()
    }

    async getBadges() {
        const badges = await Badge.findAll({
            order: [['created_at', 'ASC']],
            include: [
                {
                    model: ProfileBadge,
                    as: 'profileBadges',
                    attributes: ['id'],
                },
            ],
        })

        const BADGE_MAP: Record<string, string> = {
            '/badges/first-lesson.png': '🚀',
            '/badges/color.png': '🎨',
            '/badges/shape.png': '🔷',
            '/badges/number.png': '🔢',
            '/badges/compare.png': '⚖️',
            '/badges/time.png': '⏰',
            '/badges/streak-7.png': '🔥',
            '/badges/streak-30.png': '⚡',
            '/badges/ten-lessons.png': '🏅',
            '/badges/hundred-stars.png': '⭐',
        }

        return badges.map((b: any) => ({
            id: b.id,
            name: b.name,
            description: b.description || '',
            icon: (b.image_url && BADGE_MAP[b.image_url]) || b.image_url || '🎖️',
            category:
                b.condition_type === 'streak' ? 'streak' : b.condition_type === 'first_lesson' ? 'special' : 'lesson',
            requiredCount: b.condition_value || 1,
            requiredMetric: 'completed_lessons',
            rewardPoints: (b.condition_value || 1) * 10,
            rarity: (b.condition_value && b.condition_value > 10
                ? 'legendary'
                : b.condition_value && b.condition_value > 5
                  ? 'rare'
                  : 'common') as any,
            unlockedCount: b.profileBadges ? b.profileBadges.length : 0,
        }))
    }

    async saveBadge(data: any) {
        if (data.id) {
            const badge = await Badge.findByPk(data.id)
            if (badge) {
                await badge.update({
                    name: data.name || badge.name,
                    description: data.description !== undefined ? data.description : badge.description,
                    image_url: data.icon || badge.image_url,
                    condition_value: data.requiredCount || badge.condition_value,
                })
                return badge
            }
        }

        const code = `badge_${Date.now()}`
        const newBadge = await Badge.create({
            code,
            name: data.name,
            description: data.description || null,
            image_url: data.icon || '🎖️',
            condition_type: data.category === 'streak' ? 'streak' : 'lessons_completed',
            condition_value: data.requiredCount || 1,
            is_active: true,
        })

        return newBadge
    }

    async deleteBadge(badgeId: string) {
        const badge = await Badge.findByPk(badgeId)
        if (!badge) throw new Error('Không tìm thấy huy hiệu')
        await badge.destroy()
    }
}

export default new AdminService()

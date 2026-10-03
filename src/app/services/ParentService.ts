import { QueryTypes } from 'sequelize'

import { sequelize } from '../../config/database'
import ProfileService from './ProfileService'

interface IProfileSummaryRow {
    profile_id: string
    total_stars: number | string
    completed_lessons: number | string
    learning_days: number | string
    total_seconds: number | string
    badge_count: number | string
    sticker_count: number | string
    last_learning_at: Date | null
}

interface IChapterProgress {
    chapter_id: string
    title: string
    description: string | null
    cover_url: string | null
    order_index: number
    completed_lessons: number
    earned_stars: number
    status: string
    completed_at: Date | null
}

interface ILessonProgress {
    lesson_id: string
    chapter_id: string
    title: string
    description: string | null
    image_url: string | null
    order_index: number
    status: string
    stars: number
    best_score: number | string
    attempts_count: number
    first_completed_at: Date | null
    last_played_at: Date | null
}

interface IDailyActivity {
    activity_date: string
    lessons_done: number
    stars_gained: number
    total_seconds: number
}

interface IProfileBadge {
    id: string
    code: string
    name: string
    description: string | null
    image_url: string | null
    earned_at: Date
}

interface IProfileSticker {
    id: string
    code: string
    name: string
    description: string | null
    image_url: string | null
    unlocked_at: Date
}

const toCount = (value: number | string): number => Number(value)

class ParentService {
    private async getProfileSummary(profileIds: string[]) {
        if (profileIds.length === 0) return new Map<string, IProfileSummaryRow>()

        const rows = await sequelize.query<IProfileSummaryRow>(
            `SELECT
                p.id AS profile_id,
                p.total_stars,
                (SELECT COUNT(*)
                    FROM profile_lesson_progress AS plp
                    WHERE plp.profile_id = p.id AND plp.status = 'completed') AS completed_lessons,
                (SELECT COUNT(*)
                    FROM profile_daily_activity AS pda
                    WHERE pda.profile_id = p.id) AS learning_days,
                (SELECT COALESCE(SUM(pda.total_seconds), 0)
                    FROM profile_daily_activity AS pda
                    WHERE pda.profile_id = p.id) AS total_seconds,
                (SELECT COUNT(*)
                    FROM profile_badges AS pb
                    WHERE pb.profile_id = p.id) AS badge_count,
                (SELECT COUNT(*)
                    FROM profile_stickers AS ps
                    WHERE ps.profile_id = p.id) AS sticker_count,
                (SELECT MAX(plp.last_played_at)
                    FROM profile_lesson_progress AS plp
                    WHERE plp.profile_id = p.id) AS last_learning_at
            FROM profiles AS p
            WHERE p.id IN (:profileIds)`,
            {
                replacements: { profileIds },
                type: QueryTypes.SELECT,
            },
        )

        return new Map(rows.map((row) => [row.profile_id, row]))
    }

    async getOverview(userId: string) {
        const profiles = await ProfileService.getProfiles(userId)
        const summaries = await this.getProfileSummary(profiles.map(({ id }) => id))

        return profiles.map((profile) => {
            const summary = summaries.get(profile.id)

            return {
                id: profile.id,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                birth_date: profile.birth_date,
                summary: summary
                    ? {
                          total_stars: toCount(summary.total_stars),
                          completed_lessons: toCount(summary.completed_lessons),
                          learning_days: toCount(summary.learning_days),
                          total_seconds: toCount(summary.total_seconds),
                          badge_count: toCount(summary.badge_count),
                          sticker_count: toCount(summary.sticker_count),
                          last_learning_at: summary.last_learning_at,
                      }
                    : {
                          total_stars: profile.total_stars,
                          completed_lessons: 0,
                          learning_days: 0,
                          total_seconds: 0,
                          badge_count: 0,
                          sticker_count: 0,
                          last_learning_at: null,
                      },
            }
        })
    }

    async getProfileReport(userId: string, profileId: string) {
        const profile = await ProfileService.getProfileById(userId, profileId)
        const [summaryRows, chapters, lessons, recentActivity, badges, stickers] = await Promise.all([
            this.getProfileSummary([profileId]),
            sequelize.query<IChapterProgress>(
                `SELECT
                    c.id AS chapter_id,
                    c.title,
                    c.description,
                    c.cover_url,
                    c.order_index,
                    pcp.completed_lessons,
                    pcp.earned_stars,
                    pcp.status,
                    pcp.completed_at
                FROM profile_chapter_progress AS pcp
                INNER JOIN chapters AS c ON c.id = pcp.chapter_id
                WHERE pcp.profile_id = :profileId
                ORDER BY c.order_index ASC`,
                {
                    replacements: { profileId },
                    type: QueryTypes.SELECT,
                },
            ),
            sequelize.query<ILessonProgress>(
                `SELECT
                    l.id AS lesson_id,
                    l.chapter_id,
                    l.title,
                    l.description,
                    l.image_url,
                    l.order_index,
                    plp.status,
                    plp.stars,
                    plp.best_score,
                    plp.attempts_count,
                    plp.first_completed_at,
                    plp.last_played_at
                FROM profile_lesson_progress AS plp
                INNER JOIN lessons AS l ON l.id = plp.lesson_id
                WHERE plp.profile_id = :profileId
                ORDER BY l.chapter_id ASC, l.order_index ASC`,
                {
                    replacements: { profileId },
                    type: QueryTypes.SELECT,
                },
            ),
            sequelize.query<IDailyActivity>(
                `SELECT activity_date, lessons_done, stars_gained, total_seconds
                FROM profile_daily_activity
                WHERE profile_id = :profileId
                    AND activity_date >= CURRENT_DATE - INTERVAL 29 DAY
                ORDER BY activity_date DESC`,
                {
                    replacements: { profileId },
                    type: QueryTypes.SELECT,
                },
            ),
            sequelize.query<IProfileBadge>(
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
            sequelize.query<IProfileSticker>(
                `SELECT s.id, s.code, s.name, s.description, s.image_url, ps.unlocked_at
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

        const summary = summaryRows.get(profileId)

        return {
            profile: {
                id: profile.id,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                birth_date: profile.birth_date,
            },
            summary: {
                total_stars: summary ? toCount(summary.total_stars) : profile.total_stars,
                completed_lessons: summary ? toCount(summary.completed_lessons) : 0,
                learning_days: summary ? toCount(summary.learning_days) : 0,
                total_seconds: summary ? toCount(summary.total_seconds) : 0,
                badge_count: summary ? toCount(summary.badge_count) : 0,
                sticker_count: summary ? toCount(summary.sticker_count) : 0,
                last_learning_at: summary?.last_learning_at ?? null,
            },
            chapters,
            lessons: lessons.map((lesson) => ({
                ...lesson,
                best_score: Number(lesson.best_score),
            })),
            recent_activity: recentActivity,
            badges,
            stickers,
        }
    }
}

export default new ParentService()

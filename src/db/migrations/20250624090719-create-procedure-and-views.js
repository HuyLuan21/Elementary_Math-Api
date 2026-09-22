'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // 1. View v_roadmap
        await queryInterface.sequelize.query(`
            CREATE OR REPLACE VIEW v_roadmap AS
            SELECT
              p.id  AS profile_id,
              c.id  AS chapter_id,
              c.title,
              c.order_index,
              COUNT(DISTINCT l.id) AS total_lessons,
              COUNT(DISTINCT CASE WHEN plp.status = 'completed' THEN l.id END) AS completed_lessons,
              COALESCE(SUM(plp.stars), 0) AS earned_stars,
              COUNT(DISTINCT l.id) * 3    AS max_stars,
              pb.earned_at AS badge_earned_at
            FROM profiles p
            CROSS JOIN chapters c
            LEFT JOIN lessons l
              ON l.chapter_id = c.id AND l.is_published = 1 AND l.deleted_at IS NULL
            LEFT JOIN profile_lesson_progress plp
              ON plp.lesson_id = l.id AND plp.profile_id = p.id
            LEFT JOIN profile_badges pb
              ON pb.profile_id = p.id AND pb.chapter_id = c.id
            WHERE c.is_published = 1 AND c.deleted_at IS NULL AND p.deleted_at IS NULL
            GROUP BY p.id, c.id, c.title, c.order_index, pb.earned_at;
        `)

        // 2. Stored Procedure sp_finish_lesson
        await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_finish_lesson;`)
        await queryInterface.sequelize.query(`
            CREATE PROCEDURE sp_finish_lesson (
              IN  p_profile_id     CHAR(36),
              IN  p_lesson_id      CHAR(36),
              IN  p_correct        SMALLINT UNSIGNED,
              IN  p_total          SMALLINT UNSIGNED,
              IN  p_duration       INT UNSIGNED,
              OUT o_stars          TINYINT UNSIGNED,
              OUT o_badge_id       CHAR(36)
            )
            BEGIN
              DECLARE v_score      DECIMAL(5,2);
              DECLARE v_chapter_id CHAR(36);
              DECLARE v_t1, v_t2, v_t3 TINYINT UNSIGNED;
              DECLARE v_total_lessons, v_done_lessons INT;
              DECLARE v_badge      CHAR(36) DEFAULT NULL;

              DECLARE EXIT HANDLER FOR SQLEXCEPTION
              BEGIN ROLLBACK; RESIGNAL; END;

              START TRANSACTION;

              SELECT chapter_id, star1_threshold, star2_threshold, star3_threshold
                INTO v_chapter_id, v_t1, v_t2, v_t3
              FROM lessons WHERE id = p_lesson_id FOR UPDATE;

              SET v_score = IF(p_total = 0, 0, ROUND(p_correct * 100.0 / p_total, 2));

              SET o_stars = CASE
                WHEN v_score >= v_t3 THEN 3
                WHEN v_score >= v_t2 THEN 2
                WHEN v_score >= v_t1 THEN 1
                ELSE 0 END;

              -- 1) Ghi lịch sử
              INSERT INTO lesson_attempts
                (id, profile_id, lesson_id, correct_count, total_questions, score,
                 stars_earned, duration_seconds, started_at, finished_at)
              VALUES
                (UUID(), p_profile_id, p_lesson_id, p_correct, p_total, v_score,
                 o_stars, p_duration,
                 DATE_SUB(NOW(), INTERVAL p_duration SECOND), NOW());

              -- 2) Cập nhật tóm tắt
              INSERT INTO profile_lesson_progress
                (profile_id, lesson_id, stars, best_score, attempts_count,
                 status, first_completed_at, last_played_at)
              VALUES
                (p_profile_id, p_lesson_id, o_stars, v_score, 1,
                 IF(o_stars > 0, 'completed', 'in_progress'),
                 IF(o_stars > 0, NOW(), NULL), NOW())
              ON DUPLICATE KEY UPDATE
                stars          = GREATEST(stars, VALUES(stars)),
                best_score     = GREATEST(best_score, VALUES(best_score)),
                attempts_count = attempts_count + 1,
                status         = IF(GREATEST(stars, VALUES(stars)) > 0, 'completed', 'in_progress'),
                first_completed_at = COALESCE(first_completed_at, IF(VALUES(stars) > 0, NOW(), NULL)),
                last_played_at = NOW();

              -- 3) Cập nhật cache tổng sao của profile
              UPDATE profiles p
              SET p.total_stars = (
                SELECT COALESCE(SUM(stars), 0)
                FROM profile_lesson_progress WHERE profile_id = p_profile_id
              )
              WHERE p.id = p_profile_id;

              -- 4) Nhật ký theo ngày
              INSERT INTO profile_daily_activity
                (profile_id, activity_date, lessons_done, stars_gained, total_seconds)
              VALUES (p_profile_id, CURDATE(), 1, o_stars, p_duration)
              ON DUPLICATE KEY UPDATE
                lessons_done  = lessons_done + 1,
                stars_gained  = stars_gained + VALUES(stars_gained),
                total_seconds = total_seconds + VALUES(total_seconds);

              -- 5) Kiểm tra hoàn thành chương -> trao huy hiệu
              SELECT COUNT(*) INTO v_total_lessons
              FROM lessons
              WHERE chapter_id = v_chapter_id AND is_published = 1 AND deleted_at IS NULL;

              SELECT COUNT(*) INTO v_done_lessons
              FROM profile_lesson_progress plp
              JOIN lessons l ON l.id = plp.lesson_id
              WHERE plp.profile_id = p_profile_id
                AND l.chapter_id = v_chapter_id
                AND l.is_published = 1 AND l.deleted_at IS NULL
                AND plp.status = 'completed';

              INSERT INTO profile_chapter_progress
                (profile_id, chapter_id, completed_lessons, earned_stars, status, completed_at)
              VALUES
                (p_profile_id, v_chapter_id, v_done_lessons, 0,
                 IF(v_done_lessons >= v_total_lessons, 'completed', 'in_progress'),
                 IF(v_done_lessons >= v_total_lessons, NOW(), NULL))
              ON DUPLICATE KEY UPDATE
                completed_lessons = v_done_lessons,
                status       = IF(v_done_lessons >= v_total_lessons, 'completed', 'in_progress'),
                completed_at = IF(v_done_lessons >= v_total_lessons, COALESCE(completed_at, NOW()), NULL);

              IF v_done_lessons >= v_total_lessons AND v_total_lessons > 0 THEN
                SELECT badge_id INTO v_badge FROM chapters WHERE id = v_chapter_id;
                IF v_badge IS NOT NULL THEN
                  INSERT IGNORE INTO profile_badges (id, profile_id, badge_id, chapter_id)
                  VALUES (UUID(), p_profile_id, v_badge, v_chapter_id);
                  SET o_badge_id = IF(ROW_COUNT() > 0, v_badge, NULL);
                END IF;
              END IF;

              COMMIT;
            END;
        `)
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(`DROP VIEW IF EXISTS v_roadmap;`)
        await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_finish_lesson;`)
    },
}

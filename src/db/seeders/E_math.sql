/*
 Navicat Premium Dump SQL

 Source Server         : E_math
 Source Server Type    : MySQL
 Source Server Version : 80046 (8.0.46)
 Source Host           : localhost:3306
 Source Schema         : E_math

 Target Server Type    : MySQL
 Target Server Version : 80046 (8.0.46)
 File Encoding         : 65001

 Date: 01/10/2026 15:34:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for SequelizeMeta
-- ----------------------------
DROP TABLE IF EXISTS `SequelizeMeta`;
CREATE TABLE `SequelizeMeta`  (
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of SequelizeMeta
-- ----------------------------
INSERT INTO `SequelizeMeta` VALUES ('20250624085211-create-users-table.js');
INSERT INTO `SequelizeMeta` VALUES ('20250624090713-create-refresh_tokens-table.js');
INSERT INTO `SequelizeMeta` VALUES ('20250624090714-create-profiles-table.js');
INSERT INTO `SequelizeMeta` VALUES ('20250624090715-create-badges-table.js');
INSERT INTO `SequelizeMeta` VALUES ('20250624090716-create-chapters-and-lessons-tables.js');
INSERT INTO `SequelizeMeta` VALUES ('20250624090717-create-questions-table.js');
INSERT INTO `SequelizeMeta` VALUES ('20250624090718-create-progress-and-activity-tables.js');

-- ----------------------------
-- Table structure for attempt_answers
-- ----------------------------
DROP TABLE IF EXISTS `attempt_answers`;
CREATE TABLE `attempt_answers`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `attempt_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `question_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `given_answer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `time_spent_sec` smallint UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_aa_attempt`(`attempt_id` ASC) USING BTREE,
  INDEX `idx_aa_question`(`question_id` ASC, `is_correct` ASC) USING BTREE,
  CONSTRAINT `attempt_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `lesson_attempts` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `attempt_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of attempt_answers
-- ----------------------------

-- ----------------------------
-- Table structure for badges
-- ----------------------------
DROP TABLE IF EXISTS `badges`;
CREATE TABLE `badges`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `condition_type` enum('first_lesson','chapter_completed','streak','lessons_completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `condition_value` int UNSIGNED NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of badges
-- ----------------------------
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000301', 'FIRST_LESSON', 'Bước đầu tiên', 'Hoàn thành bài học đầu tiên', '/badges/first-lesson.png', 'first_lesson', NULL, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000302', 'COLOR_MASTER', 'Bé yêu màu sắc', 'Hoàn thành chương Màu sắc', '/badges/color.png', 'chapter_completed', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000303', 'SHAPE_MASTER', 'Bé nhận biết hình', 'Hoàn thành chương Hình dạng', '/badges/shape.png', 'chapter_completed', 2, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000304', 'NUMBER_MASTER', 'Bé giỏi số', 'Hoàn thành chương Số & đếm', '/badges/number.png', 'chapter_completed', 3, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000305', 'COMPARE_MASTER', 'Bé giỏi so sánh', 'Hoàn thành chương So sánh', '/badges/compare.png', 'chapter_completed', 4, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000306', 'TIME_MASTER', 'Bé hiểu thời gian', 'Hoàn thành chương Thời gian', '/badges/time.png', 'chapter_completed', 5, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000307', 'STREAK_7_DAYS', '7 ngày chăm chỉ', 'Học liên tục 7 ngày', '/badges/streak-7.png', 'streak', 7, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `badges` VALUES ('00000000-0000-4000-8000-000000000308', 'TEN_LESSONS', '10 bài học', 'Hoàn thành 10 bài học', '/badges/ten-lessons.png', 'lessons_completed', 10, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');

-- ----------------------------
-- Table structure for chapters
-- ----------------------------
DROP TABLE IF EXISTS `chapters`;
CREATE TABLE `chapters`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `cover_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `order_index` int NOT NULL,
  `reward_badge_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `deleted_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `order_index`(`order_index` ASC) USING BTREE,
  INDEX `reward_badge_id`(`reward_badge_id` ASC) USING BTREE,
  INDEX `created_by`(`created_by` ASC) USING BTREE,
  INDEX `idx_chapters_published`(`is_published` ASC, `order_index` ASC) USING BTREE,
  CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`reward_badge_id`) REFERENCES `badges` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `chapters_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of chapters
-- ----------------------------
INSERT INTO `chapters` VALUES ('00000000-0000-4000-8000-000000000401', 'Màu sắc', 'Làm quen và nhận biết các màu sắc cơ bản.', '/chapters/chapter-1.png', 1, '00000000-0000-4000-8000-000000000302', 1, '00000000-0000-4000-8000-000000000001', NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `chapters` VALUES ('00000000-0000-4000-8000-000000000402', 'Hình dạng', 'Nhận biết và phân biệt các hình dạng cơ bản.', '/chapters/chapter-2.png', 2, '00000000-0000-4000-8000-000000000303', 1, '00000000-0000-4000-8000-000000000001', NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `chapters` VALUES ('00000000-0000-4000-8000-000000000403', 'Số & đếm', 'Làm quen với các con số và luyện đếm.', '/chapters/chapter-3.png', 3, '00000000-0000-4000-8000-000000000304', 1, '00000000-0000-4000-8000-000000000001', NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `chapters` VALUES ('00000000-0000-4000-8000-000000000404', 'So sánh', 'Học cách so sánh nhiều hơn, ít hơn và bằng nhau.', '/chapters/chapter-4.png', 4, '00000000-0000-4000-8000-000000000305', 1, '00000000-0000-4000-8000-000000000001', NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `chapters` VALUES ('00000000-0000-4000-8000-000000000405', 'Thời gian', 'Làm quen với buổi sáng, trưa, tối và sinh hoạt hàng ngày.', '/chapters/chapter-5.png', 5, '00000000-0000-4000-8000-000000000306', 1, '00000000-0000-4000-8000-000000000001', NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');

-- ----------------------------
-- Table structure for lesson_attempts
-- ----------------------------
DROP TABLE IF EXISTS `lesson_attempts`;
CREATE TABLE `lesson_attempts`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `profile_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lesson_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `correct_count` smallint UNSIGNED NOT NULL DEFAULT 0,
  `total_questions` smallint UNSIGNED NOT NULL DEFAULT 0,
  `score` decimal(5, 2) NOT NULL DEFAULT 0.00,
  `stars_earned` tinyint UNSIGNED NOT NULL DEFAULT 0,
  `duration_seconds` int UNSIGNED NOT NULL DEFAULT 0,
  `started_at` datetime NOT NULL,
  `finished_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `lesson_id`(`lesson_id` ASC) USING BTREE,
  INDEX `idx_attempts_profile_time`(`profile_id` ASC, `finished_at` ASC) USING BTREE,
  INDEX `idx_attempts_profile_lesson`(`profile_id` ASC, `lesson_id` ASC) USING BTREE,
  CONSTRAINT `lesson_attempts_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lesson_attempts_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lesson_attempts
-- ----------------------------

-- ----------------------------
-- Table structure for lessons
-- ----------------------------
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `chapter_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `order_index` int NOT NULL,
  `reward_sticker_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_lessons_chapter_order`(`chapter_id` ASC, `order_index` ASC) USING BTREE,
  INDEX `reward_sticker_id`(`reward_sticker_id` ASC) USING BTREE,
  INDEX `idx_lessons_published`(`chapter_id` ASC, `is_published` ASC, `order_index` ASC) USING BTREE,
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`reward_sticker_id`) REFERENCES `stickers` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lessons
-- ----------------------------
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000500', '00000000-0000-4000-8000-000000000401', 'Nhận biết màu đỏ', 'Làm quen với màu đỏ.', '/lessons/lesson-1.png', 1, '00000000-0000-4000-8000-000000000200', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000401', 'Nhận biết màu xanh', 'Làm quen với màu xanh.', '/lessons/lesson-2.png', 2, '00000000-0000-4000-8000-000000000201', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000401', 'Nhận biết màu vàng', 'Làm quen với màu vàng.', '/lessons/lesson-3.png', 3, '00000000-0000-4000-8000-000000000202', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000401', 'Nhận biết màu xanh lá', 'Làm quen với màu xanh lá.', '/lessons/lesson-4.png', 4, '00000000-0000-4000-8000-000000000203', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000401', 'Bé khám phá màu sắc', 'Phân biệt các màu cơ bản.', '/lessons/lesson-5.png', 5, '00000000-0000-4000-8000-000000000204', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000402', 'Hình tròn', 'Nhận biết hình tròn.', '/lessons/lesson-6.png', 1, '00000000-0000-4000-8000-000000000205', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000402', 'Hình vuông', 'Nhận biết hình vuông.', '/lessons/lesson-7.png', 2, '00000000-0000-4000-8000-000000000206', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000402', 'Hình tam giác', 'Nhận biết hình tam giác.', '/lessons/lesson-8.png', 3, '00000000-0000-4000-8000-000000000207', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000402', 'Hình chữ nhật', 'Nhận biết hình chữ nhật.', '/lessons/lesson-9.png', 4, '00000000-0000-4000-8000-000000000208', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000402', 'Bé khám phá hình dạng', 'Phân biệt các hình cơ bản.', '/lessons/lesson-10.png', 5, '00000000-0000-4000-8000-000000000209', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000403', 'Số 1', 'Làm quen với số 1.', '/lessons/lesson-11.png', 1, '00000000-0000-4000-8000-000000000210', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000511', '00000000-0000-4000-8000-000000000403', 'Số 2', 'Làm quen với số 2.', '/lessons/lesson-12.png', 2, '00000000-0000-4000-8000-000000000211', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000512', '00000000-0000-4000-8000-000000000403', 'Số 3', 'Làm quen với số 3.', '/lessons/lesson-13.png', 3, '00000000-0000-4000-8000-000000000212', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000513', '00000000-0000-4000-8000-000000000403', 'Số 4', 'Làm quen với số 4.', '/lessons/lesson-14.png', 4, '00000000-0000-4000-8000-000000000213', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000514', '00000000-0000-4000-8000-000000000403', 'Bé tập đếm', 'Luyện đếm các đồ vật.', '/lessons/lesson-15.png', 5, '00000000-0000-4000-8000-000000000214', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000515', '00000000-0000-4000-8000-000000000404', 'Nhiều hơn', 'Nhận biết nhóm có nhiều hơn.', '/lessons/lesson-16.png', 1, '00000000-0000-4000-8000-000000000215', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000516', '00000000-0000-4000-8000-000000000404', 'Ít hơn', 'Nhận biết nhóm có ít hơn.', '/lessons/lesson-17.png', 2, '00000000-0000-4000-8000-000000000216', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000517', '00000000-0000-4000-8000-000000000404', 'Bằng nhau', 'Nhận biết hai nhóm bằng nhau.', '/lessons/lesson-18.png', 3, '00000000-0000-4000-8000-000000000217', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000518', '00000000-0000-4000-8000-000000000404', 'To và nhỏ', 'So sánh kích thước.', '/lessons/lesson-19.png', 4, '00000000-0000-4000-8000-000000000218', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000519', '00000000-0000-4000-8000-000000000404', 'Bé tập so sánh', 'Luyện kỹ năng so sánh.', '/lessons/lesson-20.png', 5, '00000000-0000-4000-8000-000000000219', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000520', '00000000-0000-4000-8000-000000000405', 'Buổi sáng', 'Nhận biết các hoạt động buổi sáng.', '/lessons/lesson-21.png', 1, '00000000-0000-4000-8000-000000000220', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000521', '00000000-0000-4000-8000-000000000405', 'Buổi trưa', 'Nhận biết các hoạt động buổi trưa.', '/lessons/lesson-22.png', 2, '00000000-0000-4000-8000-000000000221', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000522', '00000000-0000-4000-8000-000000000405', 'Buổi tối', 'Nhận biết các hoạt động buổi tối.', '/lessons/lesson-23.png', 3, '00000000-0000-4000-8000-000000000222', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000523', '00000000-0000-4000-8000-000000000405', 'Sinh hoạt hàng ngày', 'Sắp xếp hoạt động trong ngày.', '/lessons/lesson-24.png', 4, '00000000-0000-4000-8000-000000000223', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `lessons` VALUES ('00000000-0000-4000-8000-000000000524', '00000000-0000-4000-8000-000000000405', 'Làm quen với thời gian', 'Làm quen với thời gian.', '/lessons/lesson-25.png', 5, '00000000-0000-4000-8000-000000000224', 1, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');

-- ----------------------------
-- Table structure for profile_badges
-- ----------------------------
DROP TABLE IF EXISTS `profile_badges`;
CREATE TABLE `profile_badges`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `profile_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `badge_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `earned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_seen` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_profile_badge`(`profile_id` ASC, `badge_id` ASC) USING BTREE,
  INDEX `idx_profile_badges_time`(`profile_id` ASC, `earned_at` ASC) USING BTREE,
  INDEX `idx_profile_badges_badge`(`badge_id` ASC) USING BTREE,
  CONSTRAINT `profile_badges_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `profile_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of profile_badges
-- ----------------------------

-- ----------------------------
-- Table structure for profile_chapter_progress
-- ----------------------------
DROP TABLE IF EXISTS `profile_chapter_progress`;
CREATE TABLE `profile_chapter_progress`  (
  `profile_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `chapter_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `completed_lessons` int UNSIGNED NOT NULL DEFAULT 0,
  `earned_stars` int UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('locked','in_progress','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'locked',
  `completed_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`profile_id`, `chapter_id`) USING BTREE,
  INDEX `idx_pcp_chapter`(`chapter_id` ASC) USING BTREE,
  CONSTRAINT `profile_chapter_progress_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `profile_chapter_progress_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of profile_chapter_progress
-- ----------------------------
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000401', 0, 0, 'in_progress', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000402', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000403', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000404', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000405', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000401', 0, 0, 'in_progress', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000402', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000403', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000404', 0, 0, 'locked', NULL);
INSERT INTO `profile_chapter_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000405', 0, 0, 'locked', NULL);

-- ----------------------------
-- Table structure for profile_daily_activity
-- ----------------------------
DROP TABLE IF EXISTS `profile_daily_activity`;
CREATE TABLE `profile_daily_activity`  (
  `profile_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `activity_date` date NOT NULL,
  `lessons_done` smallint UNSIGNED NOT NULL DEFAULT 0,
  `stars_gained` smallint UNSIGNED NOT NULL DEFAULT 0,
  `total_seconds` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`profile_id`, `activity_date`) USING BTREE,
  INDEX `idx_daily_activity_date`(`activity_date` ASC) USING BTREE,
  CONSTRAINT `profile_daily_activity_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of profile_daily_activity
-- ----------------------------
INSERT INTO `profile_daily_activity` VALUES ('00000000-0000-4000-8000-000000000101', '2026-09-29', 0, 0, 0);

-- ----------------------------
-- Table structure for profile_lesson_progress
-- ----------------------------
DROP TABLE IF EXISTS `profile_lesson_progress`;
CREATE TABLE `profile_lesson_progress`  (
  `profile_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lesson_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('locked','unlocked','in_progress','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'locked',
  `stars` tinyint UNSIGNED NOT NULL DEFAULT 0,
  `best_score` decimal(5, 2) NOT NULL DEFAULT 0.00,
  `attempts_count` int UNSIGNED NOT NULL DEFAULT 0,
  `first_completed_at` datetime NULL DEFAULT NULL,
  `last_played_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`profile_id`, `lesson_id`) USING BTREE,
  INDEX `idx_plp_lesson`(`lesson_id` ASC) USING BTREE,
  CONSTRAINT `profile_lesson_progress_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `profile_lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of profile_lesson_progress
-- ----------------------------
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000500', 'unlocked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000501', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000502', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000503', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000504', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000505', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000506', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000507', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000508', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000509', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000510', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000511', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000512', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000513', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000514', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000515', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000516', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000517', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000518', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000519', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000520', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000521', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000522', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000523', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000524', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000500', 'unlocked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000501', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000502', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000503', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000504', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000505', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000506', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000507', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000508', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000509', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000510', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000511', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000512', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000513', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000514', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000515', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000516', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000517', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000518', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000519', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000520', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000521', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000522', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000523', 'locked', 0, 0.00, 0, NULL, NULL);
INSERT INTO `profile_lesson_progress` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000524', 'locked', 0, 0.00, 0, NULL, NULL);

-- ----------------------------
-- Table structure for profile_stickers
-- ----------------------------
DROP TABLE IF EXISTS `profile_stickers`;
CREATE TABLE `profile_stickers`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `profile_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `sticker_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `unlocked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_seen` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_profile_sticker`(`profile_id` ASC, `sticker_id` ASC) USING BTREE,
  INDEX `idx_profile_stickers`(`profile_id` ASC, `unlocked_at` ASC) USING BTREE,
  INDEX `idx_profile_stickers_sticker`(`sticker_id` ASC) USING BTREE,
  CONSTRAINT `profile_stickers_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `profile_stickers_ibfk_2` FOREIGN KEY (`sticker_id`) REFERENCES `stickers` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of profile_stickers
-- ----------------------------

-- ----------------------------
-- Table structure for profiles
-- ----------------------------
DROP TABLE IF EXISTS `profiles`;
CREATE TABLE `profiles`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `display_name` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `birth_date` date NULL DEFAULT NULL,
  `total_stars` int UNSIGNED NOT NULL DEFAULT 0,
  `deleted_at` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_profiles_user`(`user_id` ASC, `deleted_at` ASC) USING BTREE,
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of profiles
-- ----------------------------
INSERT INTO `profiles` VALUES ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'Bé Bông', '/avatars/bunny.png', '2022-05-15', 0, NULL, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `profiles` VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'CHi BEo', '🦄', '2021-10-20', 0, NULL, '2026-09-29 03:31:47', '2026-09-29 11:00:09');
INSERT INTO `profiles` VALUES ('01a0eb4c-7d12-744f-8f77-d2f5fef3afba', '00000000-0000-4000-8000-000000000001', 'Bé 3', '/avatars/kid.png', NULL, 0, NULL, '2026-09-29 10:54:13', '2026-09-29 10:54:13');
INSERT INTO `profiles` VALUES ('01a0eb4c-8109-744f-8f77-de15f3491b0f', '00000000-0000-4000-8000-000000000001', 'Bé 4', '/avatars/kid.png', NULL, 0, NULL, '2026-09-29 10:54:14', '2026-09-29 10:54:14');
INSERT INTO `profiles` VALUES ('01a0eb4c-8545-744f-8f77-e52f3fc7cc5c', '00000000-0000-4000-8000-000000000001', 'Bé 5', '/avatars/kid.png', NULL, 0, NULL, '2026-09-29 10:54:15', '2026-09-29 10:54:15');

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `lesson_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `question_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `question_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `content_json` json NULL,
  `options_json` json NULL,
  `correct_answer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `skill_tag` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `difficulty` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `order_index` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_questions_lesson_order`(`lesson_id` ASC, `order_index` ASC) USING BTREE,
  INDEX `idx_questions_skill`(`skill_tag` ASC) USING BTREE,
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of questions
-- ----------------------------
INSERT INTO `questions` VALUES ('01a0eb37-f5e9-733d-8075-e3b266968030', '00000000-0000-4000-8000-000000000500', 'color_choice', 'Quả táo này có màu gì?', '{\"image\": \"/questions/apple-red.png\"}', '[\"red\", \"blue\", \"yellow\"]', 'red', 'color', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5e9-733d-8075-ec3129fc607c', '00000000-0000-4000-8000-000000000500', 'color_choice', 'Màu đỏ là màu nào?', NULL, '[\"red\", \"green\", \"blue\"]', 'red', 'color', 1, 2, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5e9-733d-8075-f3359f48a4a2', '00000000-0000-4000-8000-000000000501', 'color_choice', 'Bầu trời thường có màu gì?', NULL, '[\"blue\", \"red\", \"yellow\"]', 'blue', 'color', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5e9-733d-8075-f85e1bc343a5', '00000000-0000-4000-8000-000000000502', 'color_choice', 'Mặt trời trong hình có màu gì?', NULL, '[\"yellow\", \"blue\", \"green\"]', 'yellow', 'color', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-03ade929b4ed', '00000000-0000-4000-8000-000000000503', 'color_choice', 'Lá cây thường có màu gì?', NULL, '[\"green\", \"red\", \"blue\"]', 'green', 'color', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-0a58576e3e6c', '00000000-0000-4000-8000-000000000505', 'shape_choice', 'Đâu là hình tròn?', NULL, '[\"circle\", \"square\", \"triangle\"]', 'circle', 'shape', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-11b43ea90e59', '00000000-0000-4000-8000-000000000506', 'shape_choice', 'Đâu là hình vuông?', NULL, '[\"circle\", \"square\", \"triangle\"]', 'square', 'shape', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-18094630ffb5', '00000000-0000-4000-8000-000000000507', 'shape_choice', 'Đâu là hình tam giác?', NULL, '[\"triangle\", \"circle\", \"square\"]', 'triangle', 'shape', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-243347780ac6', '00000000-0000-4000-8000-000000000508', 'shape_choice', 'Đâu là hình chữ nhật?', NULL, '[\"rectangle\", \"circle\", \"triangle\"]', 'rectangle', 'shape', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-2d7fb9ef2e41', '00000000-0000-4000-8000-000000000509', 'shape_choice', 'Hình nào không phải hình tròn?', NULL, '[\"circle\", \"square\", \"triangle\"]', 'square', 'shape', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-335ec9be25b3', '00000000-0000-4000-8000-000000000510', 'counting', 'Có bao nhiêu quả táo?', '{\"item\": \"apple\", \"count\": 1}', '[\"1\", \"2\", \"3\"]', '1', 'number', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-3fc4f2a578be', '00000000-0000-4000-8000-000000000511', 'counting', 'Có bao nhiêu quả bóng?', '{\"item\": \"ball\", \"count\": 2}', '[\"1\", \"2\", \"3\"]', '2', 'number', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-46695d292ac7', '00000000-0000-4000-8000-000000000512', 'counting', 'Có bao nhiêu chú mèo?', '{\"item\": \"cat\", \"count\": 3}', '[\"2\", \"3\", \"4\"]', '3', 'number', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-4b6f9a0d3df1', '00000000-0000-4000-8000-000000000513', 'counting', 'Có bao nhiêu con cá?', '{\"item\": \"fish\", \"count\": 4}', '[\"3\", \"4\", \"5\"]', '4', 'number', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-550bb8ac746e', '00000000-0000-4000-8000-000000000514', 'counting', 'Hãy đếm số quả bóng.', '{\"item\": \"ball\", \"count\": 3}', '[\"2\", \"3\", \"4\"]', '3', 'counting', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-5b3a003f5503', '00000000-0000-4000-8000-000000000515', 'comparison', 'Nhóm nào có nhiều hơn?', '{\"item\": \"apple\", \"left\": 3, \"right\": 1}', '[\"left\", \"right\"]', 'left', 'comparison', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-6657469a5099', '00000000-0000-4000-8000-000000000516', 'comparison', 'Nhóm nào có ít hơn?', '{\"item\": \"ball\", \"left\": 1, \"right\": 3}', '[\"left\", \"right\"]', 'left', 'comparison', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-6f2368611567', '00000000-0000-4000-8000-000000000517', 'comparison', 'Hai nhóm có bằng nhau không?', '{\"item\": \"star\", \"left\": 2, \"right\": 2}', '[\"equal\", \"not_equal\"]', 'equal', 'comparison', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-723cbb1d4a66', '00000000-0000-4000-8000-000000000518', 'comparison', 'Con vật nào to hơn?', '{\"left\": \"elephant\", \"right\": \"cat\"}', '[\"elephant\", \"cat\"]', 'elephant', 'comparison', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-787a54eaf8ee', '00000000-0000-4000-8000-000000000519', 'comparison', 'Nhóm nào có nhiều đồ vật hơn?', '{\"item\": \"toy\", \"left\": 4, \"right\": 2}', '[\"left\", \"right\"]', 'left', 'comparison', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-8307db2b6de4', '00000000-0000-4000-8000-000000000520', 'image_choice', 'Hoạt động nào thường làm vào buổi sáng?', NULL, '[\"brush_teeth\", \"sleep\", \"watch_stars\"]', 'brush_teeth', 'time', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-8b36b57a695a', '00000000-0000-4000-8000-000000000521', 'image_choice', 'Hoạt động nào thường làm vào buổi trưa?', NULL, '[\"lunch\", \"sleep_at_night\", \"wake_up\"]', 'lunch', 'time', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-93a6e562f97b', '00000000-0000-4000-8000-000000000522', 'image_choice', 'Hoạt động nào thường làm vào buổi tối?', NULL, '[\"sleep\", \"go_to_school\", \"breakfast\"]', 'sleep', 'time', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-9e38ff4fb56a', '00000000-0000-4000-8000-000000000523', 'image_choice', 'Việc nào thường làm trước khi đi ngủ?', NULL, '[\"brush_teeth\", \"go_to_school\", \"have_breakfast\"]', 'brush_teeth', 'time', 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `questions` VALUES ('01a0eb37-f5ea-733d-8076-a6614fd274c8', '00000000-0000-4000-8000-000000000524', 'time', 'Kim đồng hồ đang chỉ mấy giờ?', '{\"hour\": 3, \"minute\": 0}', '[\"2:00\", \"3:00\", \"4:00\"]', '3:00', 'time', 2, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');

-- ----------------------------
-- Table structure for refresh_tokens
-- ----------------------------
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `refresh_token` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_refresh_tokens_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of refresh_tokens
-- ----------------------------
INSERT INTO `refresh_tokens` VALUES ('01a0eb3a-95d9-7ff0-8c2c-63bb8f6c239e', '00000000-0000-4000-8000-000000000001', '2026-09-29 10:34:40', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiODM0NmU2NDUtM2U1NC00OWQ4LWEyMjAtZWQyNWZmMmE4ZTMwIiwiaWF0IjoxNzkwNjUyODgwLCJleHAiOjE3OTEyNTc2ODB9.X7uFh8kVO1VuM3-eo14A7XEkzPRmRzDxgMtM96BsaF4', '2026-09-29 10:34:40');
INSERT INTO `refresh_tokens` VALUES ('01a0eb4a-b74f-7005-91d6-90bf5e595774', '00000000-0000-4000-8000-000000000001', '2026-09-29 10:52:17', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiNDc1M2QxYzYtZDA0MS00NDExLTgwNmQtZmQ5ZTQ0NGI2MTA2IiwiaWF0IjoxNzkwNjUzOTM3LCJleHAiOjE3OTEyNTg3Mzd9.vM0d5p93vyNciA8nUYXsHculsN2MB1aiEamXUu5yHpk', '2026-09-29 10:52:17');
INSERT INTO `refresh_tokens` VALUES ('01a0eb57-988b-744f-8f77-ea085e79abfc', '00000000-0000-4000-8000-000000000001', '2026-09-29 11:06:21', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiYWU5YjlkOGQtZGVjZS00NzJkLWIwYmMtNWFiMjQ0YzM2YmMxIiwiaWF0IjoxNzkwNjU0NzgxLCJleHAiOjE3OTEyNTk1ODF9.C9m-uhlSEbxYZYDP3EfuzLhFolL2K6l173lcmJz1XTM', '2026-09-29 11:06:21');
INSERT INTO `refresh_tokens` VALUES ('01a0eb58-136d-744f-8f77-f527fc1f53fc', '00000000-0000-4000-8000-000000000001', '2026-09-29 11:06:53', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiNTdmNjk5OWQtZmQ5Ni00ZTg5LTk3NzQtNTU3MTFlOTE5YjQ1IiwiaWF0IjoxNzkwNjU0ODEzLCJleHAiOjE3OTEyNTk2MTN9.6axz7qXBVXijMPxd69JPZP4P2iYGHZzL6Du8qw1-n5E', '2026-09-29 11:06:53');
INSERT INTO `refresh_tokens` VALUES ('01a0eb5b-dae2-744f-8f77-fbfbe0478e9f', '00000000-0000-4000-8000-000000000001', '2026-09-29 11:11:00', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiZjAzY2YzZTgtMGFkNC00NjU0LTlkODctNjcwYjNlOTI5OTc1IiwiaWF0IjoxNzkwNjU1MDYwLCJleHAiOjE3OTEyNTk4NjB9.G0aNw_behC440sOo9SwLeeg-gRfhOM4IMHcDvx0O9i4', '2026-09-29 11:11:00');
INSERT INTO `refresh_tokens` VALUES ('01a0eb5c-b17c-744f-8f78-03555917535a', '00000000-0000-4000-8000-000000000001', '2026-09-29 11:11:55', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiOTdlNDBjMzktZjk3Ni00ZWI4LTg1NTMtOTI4YzRiODNhZWUyIiwiaWF0IjoxNzkwNjU1MTE1LCJleHAiOjE3OTEyNTk5MTV9.bJ1p23pn0tjiCiV5jZ2mHAgkWb0KbKRYaMS5FK1gIDo', '2026-09-29 11:11:55');
INSERT INTO `refresh_tokens` VALUES ('01a0f31b-be98-7ddd-9e8c-9d0f23dca466', '00000000-0000-4000-8000-000000000001', '2026-09-30 23:17:56', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiODk0YjBhOWQtMTU1OC00YTg0LWE1Y2ItNmJkYjMyMDY5MzEyIiwiaWF0IjoxNzkwNzg1MDc2LCJleHAiOjE3OTEzODk4NzZ9.mUdMzqz3flGavUCmxe22xz3flZDiHIXJgqP3Ink16jc', '2026-09-30 23:17:56');
INSERT INTO `refresh_tokens` VALUES ('01a0f663-d148-7994-a511-d5323774ff05', '00000000-0000-4000-8000-000000000001', '2026-10-01 14:35:31', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiNTQ1NGMwZjAtZThkYS00NDM5LWFjM2QtYTdkZmNhNzU4YTBlIiwiaWF0IjoxNzkwODQwMTMxLCJleHAiOjE3OTE0NDQ5MzF9.OzlBXjeTV0EIu1X_GZcvHAOnOVdjEdERjshenwl_Z2k', '2026-10-01 14:35:31');
INSERT INTO `refresh_tokens` VALUES ('01a0f68c-5ad3-7994-a511-da1fb5b74f76', '00000000-0000-4000-8000-000000000001', '2026-10-01 15:19:48', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoicGFyZW50IiwianRpIjoiMzY2NTJjZDQtZDhmNy00YTc3LTk3ZjctOTZmNzIzNTY5ZTU5IiwiaWF0IjoxNzkwODQyNzg4LCJleHAiOjE3OTE0NDc1ODh9.8P48dKYGOpfngtvBL0rlySfrwbFocQa8A5bPgSIh9JE', '2026-10-01 15:19:48');

-- ----------------------------
-- Table structure for stickers
-- ----------------------------
DROP TABLE IF EXISTS `stickers`;
CREATE TABLE `stickers`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sound_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  UNIQUE INDEX `order_index`(`order_index` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of stickers
-- ----------------------------
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000200', 'STICKER_RED', 'Mèo đỏ', 'Học màu đỏ', '/stickers/sticker_red.png', NULL, 1, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000201', 'STICKER_BLUE', 'Cá xanh', 'Học màu xanh', '/stickers/sticker_blue.png', NULL, 2, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000202', 'STICKER_YELLOW', 'Vịt vàng', 'Học màu vàng', '/stickers/sticker_yellow.png', NULL, 3, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000203', 'STICKER_GREEN', 'Ếch xanh lá', 'Học màu xanh lá', '/stickers/sticker_green.png', NULL, 4, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000204', 'STICKER_MIXED_COLORS', 'Cầu vồng', 'Nhận biết nhiều màu', '/stickers/sticker_mixed_colors.png', NULL, 5, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000205', 'STICKER_CIRCLE', 'Gấu tròn', 'Nhận biết hình tròn', '/stickers/sticker_circle.png', NULL, 6, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000206', 'STICKER_SQUARE', 'Gấu vuông', 'Nhận biết hình vuông', '/stickers/sticker_square.png', NULL, 7, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000207', 'STICKER_TRIANGLE', 'Cá tam giác', 'Nhận biết hình tam giác', '/stickers/sticker_triangle.png', NULL, 8, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000208', 'STICKER_RECTANGLE', 'Hươu chữ nhật', 'Nhận biết hình chữ nhật', '/stickers/sticker_rectangle.png', NULL, 9, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000209', 'STICKER_SHAPES', 'Bộ hình dạng', 'Phân biệt các hình', '/stickers/sticker_shapes.png', NULL, 10, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000210', 'STICKER_ONE', 'Một chú ong', 'Nhận biết số 1', '/stickers/sticker_one.png', NULL, 11, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000211', 'STICKER_TWO', 'Hai chú vịt', 'Nhận biết số 2', '/stickers/sticker_two.png', NULL, 12, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000212', 'STICKER_THREE', 'Ba chú mèo', 'Nhận biết số 3', '/stickers/sticker_three.png', NULL, 13, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000213', 'STICKER_FOUR', 'Bốn chú cá', 'Nhận biết số 4', '/stickers/sticker_four.png', NULL, 14, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000214', 'STICKER_COUNTING', 'Chuyên gia đếm', 'Luyện đếm', '/stickers/sticker_counting.png', NULL, 15, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000215', 'STICKER_MORE', 'Voi nhiều hơn', 'So sánh nhiều hơn', '/stickers/sticker_more.png', NULL, 16, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000216', 'STICKER_LESS', 'Thỏ ít hơn', 'So sánh ít hơn', '/stickers/sticker_less.png', NULL, 17, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000217', 'STICKER_EQUAL', 'Hai bạn bằng nhau', 'Nhận biết bằng nhau', '/stickers/sticker_equal.png', NULL, 18, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000218', 'STICKER_BIG_SMALL', 'Gấu to nhỏ', 'So sánh kích thước', '/stickers/sticker_big_small.png', NULL, 19, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000219', 'STICKER_COMPARE', 'Siêu so sánh', 'Luyện so sánh', '/stickers/sticker_compare.png', NULL, 20, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000220', 'STICKER_MORNING', 'Mặt trời', 'Buổi sáng', '/stickers/sticker_morning.png', NULL, 21, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000221', 'STICKER_NOON', 'Mặt trời trưa', 'Buổi trưa', '/stickers/sticker_noon.png', NULL, 22, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000222', 'STICKER_NIGHT', 'Mặt trăng', 'Buổi tối', '/stickers/sticker_night.png', NULL, 23, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000223', 'STICKER_ROUTINE', 'Chú gấu lịch trình', 'Sinh hoạt hàng ngày', '/stickers/sticker_routine.png', NULL, 24, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');
INSERT INTO `stickers` VALUES ('00000000-0000-4000-8000-000000000224', 'STICKER_TIME', 'Đồng hồ vui vẻ', 'Làm quen với thời gian', '/stickers/sticker_time.png', NULL, 25, 1, '2026-09-29 03:31:47', '2026-09-29 03:31:47');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `role` enum('parent','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'parent',
  `status` enum('active','locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `pin_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `pin_hash` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_2`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_3`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_4`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_5`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_6`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_7`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_8`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_9`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_10`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_11`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_12`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_13`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_14`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('00000000-0000-4000-8000-000000000001', 'parent@example.com', '$2a$12$w4hdGZ9UfzRRVPfSkTXlXOla0px2YWpTFSN66rFgi6uzKd08nuZOu', 'Nguyễn Văn A', 'parent', 'active', 1, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCz6W0j0q4s5QJ9xYj7S', '2026-09-29 03:31:47', '2026-09-29 03:31:47', '', '');

SET FOREIGN_KEY_CHECKS = 1;

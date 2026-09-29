'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. profile_lesson_progress
        await queryInterface.createTable('profile_lesson_progress', {
            profile_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            lesson_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'lessons',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            status: {
                type: Sequelize.ENUM('locked', 'unlocked', 'in_progress', 'completed'),
                allowNull: false,
                defaultValue: 'locked',
            },
            stars: {
                type: Sequelize.TINYINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            best_score: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0.0,
            },
            attempts_count: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            first_completed_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
            last_played_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
        })

        await queryInterface.addIndex('profile_lesson_progress', ['lesson_id'], {
            name: 'idx_plp_lesson',
        })

        // 2. lesson_attempts
        await queryInterface.createTable('lesson_attempts', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            profile_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            lesson_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'lessons',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            correct_count: {
                type: Sequelize.SMALLINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            total_questions: {
                type: Sequelize.SMALLINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            score: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0.0,
            },
            stars_earned: {
                type: Sequelize.TINYINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            duration_seconds: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            started_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            finished_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
        })

        await queryInterface.addIndex('lesson_attempts', ['profile_id', 'finished_at'], {
            name: 'idx_attempts_profile_time',
        })

        await queryInterface.addIndex('lesson_attempts', ['profile_id', 'lesson_id'], {
            name: 'idx_attempts_profile_lesson',
        })

        // 3. attempt_answers
        await queryInterface.createTable('attempt_answers', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            attempt_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'lesson_attempts',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            question_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'questions',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            given_answer: {
                type: Sequelize.STRING(255),
                allowNull: true,
                defaultValue: null,
            },
            is_correct: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            time_spent_sec: {
                type: Sequelize.SMALLINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
        })

        await queryInterface.addIndex('attempt_answers', ['attempt_id'], {
            name: 'idx_aa_attempt',
        })

        await queryInterface.addIndex('attempt_answers', ['question_id', 'is_correct'], {
            name: 'idx_aa_question',
        })

        // 4. profile_stickers
        await queryInterface.createTable('profile_stickers', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            profile_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            sticker_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stickers',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            unlocked_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            is_seen: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        })

        await queryInterface.addConstraint('profile_stickers', {
            fields: ['profile_id', 'sticker_id'],
            type: 'unique',
            name: 'uk_profile_sticker',
        })

        await queryInterface.addIndex('profile_stickers', ['profile_id', 'unlocked_at'], {
            name: 'idx_profile_stickers',
        })

        await queryInterface.addIndex('profile_stickers', ['sticker_id'], {
            name: 'idx_profile_stickers_sticker',
        })

        // 5. profile_badges
        await queryInterface.createTable('profile_badges', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            profile_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            badge_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'badges',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            earned_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            is_seen: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        })

        await queryInterface.addConstraint('profile_badges', {
            fields: ['profile_id', 'badge_id'],
            type: 'unique',
            name: 'uk_profile_badge',
        })

        await queryInterface.addIndex('profile_badges', ['profile_id', 'earned_at'], {
            name: 'idx_profile_badges_time',
        })

        await queryInterface.addIndex('profile_badges', ['badge_id'], {
            name: 'idx_profile_badges_badge',
        })

        // 6. profile_chapter_progress
        await queryInterface.createTable('profile_chapter_progress', {
            profile_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            chapter_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'chapters',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            completed_lessons: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            earned_stars: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM('locked', 'in_progress', 'completed'),
                allowNull: false,
                defaultValue: 'locked',
            },
            completed_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
        })

        await queryInterface.addIndex('profile_chapter_progress', ['chapter_id'], {
            name: 'idx_pcp_chapter',
        })

        // 7. profile_daily_activity
        await queryInterface.createTable('profile_daily_activity', {
            profile_id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'profiles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            activity_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                primaryKey: true,
            },
            lessons_done: {
                type: Sequelize.SMALLINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            stars_gained: {
                type: Sequelize.SMALLINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            total_seconds: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
        })

        await queryInterface.addIndex('profile_daily_activity', ['activity_date'], {
            name: 'idx_daily_activity_date',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('profile_daily_activity')
        await queryInterface.dropTable('profile_chapter_progress')
        await queryInterface.dropTable('profile_badges')
        await queryInterface.dropTable('profile_stickers')
        await queryInterface.dropTable('attempt_answers')
        await queryInterface.dropTable('lesson_attempts')
        await queryInterface.dropTable('profile_lesson_progress')
    },
}

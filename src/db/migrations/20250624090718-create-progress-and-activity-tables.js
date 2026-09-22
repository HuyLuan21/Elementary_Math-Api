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
            stars: {
                type: Sequelize.TINYINT.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            best_score: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0,
            },
            attempts_count: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM('unlocked', 'in_progress', 'completed'),
                allowNull: false,
                defaultValue: 'unlocked',
            },
            first_completed_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            last_played_at: {
                type: Sequelize.DATE,
                allowNull: true,
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
                defaultValue: 0,
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

        // 4. profile_chapter_progress
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
            },
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
            chapter_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'chapters',
                    key: 'id',
                },
                onDelete: 'SET NULL',
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
            name: 'idx_pb_profile_time',
        })

        // 6. profile_daily_activity
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('profile_daily_activity')
        await queryInterface.dropTable('profile_badges')
        await queryInterface.dropTable('profile_chapter_progress')
        await queryInterface.dropTable('attempt_answers')
        await queryInterface.dropTable('lesson_attempts')
        await queryInterface.dropTable('profile_lesson_progress')
    },
}

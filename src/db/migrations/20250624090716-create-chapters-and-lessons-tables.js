'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Chapters
        await queryInterface.createTable('chapters', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            cover_url: {
                type: Sequelize.STRING(500),
                allowNull: true,
                defaultValue: null,
            },
            order_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
            },
            reward_badge_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'badges',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        })

        await queryInterface.addIndex('chapters', ['is_published', 'order_index'], {
            name: 'idx_chapters_published',
        })

        // 2. Lessons
        await queryInterface.createTable('lessons', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            chapter_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'chapters',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            title: {
                type: Sequelize.STRING(200),
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(500),
                allowNull: true,
                defaultValue: null,
            },
            image_url: {
                type: Sequelize.STRING(500),
                allowNull: true,
                defaultValue: null,
            },
            order_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            reward_sticker_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'stickers',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        })

        await queryInterface.addConstraint('lessons', {
            fields: ['chapter_id', 'order_index'],
            type: 'unique',
            name: 'uk_lessons_chapter_order',
        })

        await queryInterface.addIndex('lessons', ['chapter_id', 'is_published', 'order_index'], {
            name: 'idx_lessons_published',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('lessons')
        await queryInterface.dropTable('chapters')
    },
}

'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. stickers
        await queryInterface.createTable('stickers', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(60),
                allowNull: false,
                unique: true,
            },
            name: {
                type: Sequelize.STRING(120),
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
            sound_url: {
                type: Sequelize.STRING(500),
                allowNull: true,
                defaultValue: null,
            },
            order_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                unique: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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

        // 2. badges
        await queryInterface.createTable('badges', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(60),
                allowNull: false,
                unique: true,
            },
            name: {
                type: Sequelize.STRING(120),
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
            condition_type: {
                type: Sequelize.ENUM('first_lesson', 'chapter_completed', 'streak', 'lessons_completed'),
                allowNull: false,
            },
            condition_value: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: true,
                defaultValue: null,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('badges')
        await queryInterface.dropTable('stickers')
    },
}

'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('questions', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
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
            question_type: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            question_text: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null,
            },
            content_json: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
            },
            options_json: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
            },
            correct_answer: {
                type: Sequelize.STRING(255),
                allowNull: true,
                defaultValue: null,
            },
            skill_tag: {
                type: Sequelize.STRING(60),
                allowNull: true,
                defaultValue: null,
            },
            difficulty: {
                type: Sequelize.TINYINT.UNSIGNED,
                allowNull: false,
                defaultValue: 1,
            },
            order_index: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
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

        await queryInterface.addConstraint('questions', {
            fields: ['lesson_id', 'order_index'],
            type: 'unique',
            name: 'uk_questions_lesson_order',
        })

        await queryInterface.addIndex('questions', ['skill_tag'], {
            name: 'idx_questions_skill',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('questions')
    },
}

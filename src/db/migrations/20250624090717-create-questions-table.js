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
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            image_url: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            question_type: {
                type: Sequelize.ENUM('multiple_choice', 'fill_blank', 'matching', 'drag_drop'),
                allowNull: false,
                defaultValue: 'multiple_choice',
            },
            options_json: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            correct_answer: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            skill_tag: {
                type: Sequelize.STRING(60),
                allowNull: true,
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
        })

        await queryInterface.addIndex('questions', ['lesson_id', 'order_index'], {
            name: 'idx_questions_lesson',
        })

        await queryInterface.addIndex('questions', ['skill_tag'], {
            name: 'idx_questions_skill',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('questions')
    },
}

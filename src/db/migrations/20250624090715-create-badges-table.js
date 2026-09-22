'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
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
            },
            image_url: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            rarity: {
                type: Sequelize.ENUM('common', 'rare', 'epic'),
                allowNull: false,
                defaultValue: 'common',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('badges')
    },
}

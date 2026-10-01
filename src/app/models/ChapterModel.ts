import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class Chapter extends Model<InferAttributes<Chapter>, InferCreationAttributes<Chapter>> {
    declare id: CreationOptional<string>
    declare title: string
    declare description: CreationOptional<string | null>
    declare cover_url: CreationOptional<string | null>
    declare order_index: number
    declare reward_badge_id: CreationOptional<string | null>
    declare is_published: CreationOptional<boolean>
    declare created_by: CreationOptional<string | null>
    declare deleted_at: CreationOptional<Date | null>
    declare created_at?: Date
    declare updated_at?: Date

    static associate(models: any) {
        this.hasMany(models.Lesson, { foreignKey: 'chapter_id', as: 'lessons' })
        this.belongsTo(models.Badge, { foreignKey: 'reward_badge_id', as: 'rewardBadge' })
    }
}

Chapter.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
        },
        cover_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reward_badge_id: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: 'chapters',
        sequelize,
        paranoid: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    },
)

export default Chapter

import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class Badge extends Model<InferAttributes<Badge>, InferCreationAttributes<Badge>> {
    declare id: CreationOptional<string>
    declare code: string
    declare name: string
    declare description: CreationOptional<string | null>
    declare image_url: CreationOptional<string | null>
    declare condition_type: 'first_lesson' | 'chapter_completed' | 'streak' | 'lessons_completed'
    declare condition_value: CreationOptional<number | null>
    declare is_active: CreationOptional<boolean>
    declare created_at?: Date
    declare updated_at?: Date

    static associate(models: any) {
        this.hasMany(models.ProfileBadge, { foreignKey: 'badge_id', as: 'profileBadges' })
    }
}

Badge.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        code: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
        },
        condition_type: {
            type: DataTypes.ENUM('first_lesson', 'chapter_completed', 'streak', 'lessons_completed'),
            allowNull: false,
        },
        condition_value: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: 'badges',
        sequelize,
        paranoid: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
)

export default Badge

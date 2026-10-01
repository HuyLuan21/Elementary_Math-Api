import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class Lesson extends Model<InferAttributes<Lesson>, InferCreationAttributes<Lesson>> {
    declare id: CreationOptional<string>
    declare chapter_id: string
    declare title: string
    declare description: CreationOptional<string | null>
    declare image_url: CreationOptional<string | null>
    declare order_index: number
    declare reward_sticker_id: CreationOptional<string | null>
    declare is_published: CreationOptional<boolean>
    declare deleted_at: CreationOptional<Date | null>
    declare created_at?: Date
    declare updated_at?: Date

    static associate(models: any) {
        this.belongsTo(models.Chapter, { foreignKey: 'chapter_id', as: 'chapter' })
        this.hasMany(models.Question, { foreignKey: 'lesson_id', as: 'questions' })
        this.belongsTo(models.Sticker, { foreignKey: 'reward_sticker_id', as: 'rewardSticker' })
        this.hasMany(models.ProfileLessonProgress, { foreignKey: 'lesson_id', as: 'progressList' })
    }
}

Lesson.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        chapter_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'chapters',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING(200),
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
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reward_sticker_id: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: 'lessons',
        sequelize,
        paranoid: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    },
)

export default Lesson

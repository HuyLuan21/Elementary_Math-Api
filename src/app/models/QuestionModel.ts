import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
    declare id: CreationOptional<string>
    declare lesson_id: string
    declare question_type: string
    declare question_text: CreationOptional<string | null>
    declare content_json: CreationOptional<any>
    declare options_json: CreationOptional<any>
    declare correct_answer: CreationOptional<string | null>
    declare skill_tag: CreationOptional<string | null>
    declare difficulty: CreationOptional<number>
    declare order_index: number
    declare created_at?: Date
    declare updated_at?: Date

    static associate(models: any) {
        this.belongsTo(models.Lesson, { foreignKey: 'lesson_id', as: 'lesson' })
    }
}

Question.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        lesson_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'lessons',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        question_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        question_text: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
        },
        content_json: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        options_json: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },
        correct_answer: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        skill_tag: {
            type: DataTypes.STRING(60),
            allowNull: true,
            defaultValue: null,
        },
        difficulty: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: 'questions',
        sequelize,
        paranoid: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
)

export default Question

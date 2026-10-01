import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'

import { sequelize } from '../../config/database'

class ProfileLessonProgress extends Model<InferAttributes<ProfileLessonProgress>, InferCreationAttributes<ProfileLessonProgress>> {
    declare profile_id: string
    declare lesson_id: string
    declare status: 'locked' | 'unlocked' | 'in_progress' | 'completed'
    declare stars: CreationOptional<number>
    declare best_score: CreationOptional<number>
    declare attempts_count: CreationOptional<number>
    declare first_completed_at: CreationOptional<Date | null>
    declare last_played_at: CreationOptional<Date | null>

    static associate(models: any) {
        this.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'profile' })
        this.belongsTo(models.Lesson, { foreignKey: 'lesson_id', as: 'lesson' })
    }
}

ProfileLessonProgress.init(
    {
        profile_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'profiles',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        lesson_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'lessons',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        status: {
            type: DataTypes.ENUM('locked', 'unlocked', 'in_progress', 'completed'),
            allowNull: false,
            defaultValue: 'locked',
        },
        stars: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        best_score: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        attempts_count: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        first_completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        last_played_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: 'profile_lesson_progress',
        sequelize,
        timestamps: false,
        paranoid: false,
    },
)

export default ProfileLessonProgress

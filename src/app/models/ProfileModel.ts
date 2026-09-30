import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class Profile extends Model<InferAttributes<Profile>, InferCreationAttributes<Profile>> {
    declare id: CreationOptional<string>
    declare user_id: string
    declare display_name: string
    declare avatar_url: CreationOptional<string | null>
    declare birth_date: CreationOptional<string | null>
    declare total_stars: CreationOptional<number>
    declare deleted_at: CreationOptional<Date | null>
    declare created_at?: Date
    declare updated_at?: Date

    static associate(models: any) {
        this.belongsTo(models.User, { foreignKey: 'user_id' })
    }
}

Profile.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        display_name: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        avatar_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
        },
        birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            defaultValue: null,
        },
        total_stars: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: 'profiles',
        sequelize,
        paranoid: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
    },
)

export default Profile

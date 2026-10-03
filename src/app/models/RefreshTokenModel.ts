import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
    declare id: CreationOptional<string>
    declare user_id: string
    declare refresh_token: string
    declare expires_at: Date
    declare revoked_at: CreationOptional<Date | null>
    declare created_at: CreationOptional<Date>

    static associate(models: any) {
        this.belongsTo(models.User, { foreignKey: 'user_id' })
    }
}

RefreshToken.init(
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
            onUpdate: 'CASCADE',
        },
        refresh_token: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: true,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'refresh_tokens',
        sequelize,
        timestamps: false,
    },
)

export default RefreshToken

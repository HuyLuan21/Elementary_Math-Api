import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class ProfileSticker extends Model<InferAttributes<ProfileSticker>, InferCreationAttributes<ProfileSticker>> {
    declare id: CreationOptional<string>
    declare profile_id: string
    declare sticker_id: string
    declare unlocked_at: CreationOptional<Date>
    declare is_seen: CreationOptional<boolean>

    static associate(models: any) {
        this.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'profile' })
        this.belongsTo(models.Sticker, { foreignKey: 'sticker_id', as: 'sticker' })
    }
}

ProfileSticker.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        profile_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'profiles',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        sticker_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'stickers',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        unlocked_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        is_seen: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'profile_stickers',
        sequelize,
        timestamps: false,
        paranoid: false,
    },
)

export default ProfileSticker

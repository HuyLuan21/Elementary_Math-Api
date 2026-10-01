import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class Sticker extends Model<InferAttributes<Sticker>, InferCreationAttributes<Sticker>> {
    declare id: CreationOptional<string>
    declare code: string
    declare name: string
    declare description: CreationOptional<string | null>
    declare image_url: CreationOptional<string | null>
    declare sound_url: CreationOptional<string | null>
    declare order_index: number
    declare is_active: CreationOptional<boolean>
    declare created_at?: Date
    declare updated_at?: Date

    static associate(models: any) {
        this.hasMany(models.ProfileSticker, { foreignKey: 'sticker_id', as: 'profileStickers' })
    }
}

Sticker.init(
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
        sound_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: null,
        },
        order_index: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: 'stickers',
        sequelize,
        paranoid: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
)

export default Sticker

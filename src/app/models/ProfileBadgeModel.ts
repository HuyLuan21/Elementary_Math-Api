import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class ProfileBadge extends Model<InferAttributes<ProfileBadge>, InferCreationAttributes<ProfileBadge>> {
    declare id: CreationOptional<string>
    declare profile_id: string
    declare badge_id: string
    declare earned_at: CreationOptional<Date>
    declare is_seen: CreationOptional<boolean>

    static associate(models: any) {
        this.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'profile' })
        this.belongsTo(models.Badge, { foreignKey: 'badge_id', as: 'badge' })
    }
}

ProfileBadge.init(
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
        badge_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'badges',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        earned_at: {
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
        tableName: 'profile_badges',
        sequelize,
        timestamps: false,
        paranoid: false,
    },
)

export default ProfileBadge

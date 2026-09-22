import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v7 as uuidv7 } from 'uuid'

import { sequelize } from '../../config/database'

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<string>
    declare email: string
    declare password_hash: string
    declare full_name: CreationOptional<string | null>
    declare first_name: CreationOptional<string>
    declare last_name: CreationOptional<string>
    declare role: CreationOptional<'parent' | 'admin'>
    declare status: CreationOptional<'active' | 'locked'>
    declare created_at?: Date
    declare updated_at?: Date

    // Virtual getters for status check
    declare is_active?: boolean
    declare is_blocked?: boolean

    static associate(models: any) {
        this.hasMany(models.RefreshToken, { foreignKey: 'user_id' })
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: uuidv7,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(120),
            allowNull: true,
            defaultValue: null,
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: '',
        },
        role: {
            type: DataTypes.ENUM('parent', 'admin'),
            allowNull: false,
            defaultValue: 'parent',
        },
        status: {
            type: DataTypes.ENUM('active', 'locked'),
            allowNull: false,
            defaultValue: 'active',
        },
        is_active: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.status === 'active'
            },
        },
        is_blocked: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.status === 'locked'
            },
        },
    },
    {
        tableName: 'users',
        sequelize,
        defaultScope: {
            attributes: {
                exclude: ['password_hash'],
            },
        },
        scopes: {
            withPassword: {
                attributes: {
                    include: ['password_hash'],
                },
            },
        },
    },
)

export default User

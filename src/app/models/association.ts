import RefreshToken from './RefreshTokenModel'
import User from './UserModel'

const associations = () => {
    const models: any = {
        User,
        RefreshToken,
    }

    Object.values(models).forEach((model: any) => {
        if (model.associate) {
            model.associate(models)
        }
    })
}

export default associations

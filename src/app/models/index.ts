import { sequelize } from '../../config/database'
import associations from './association'
import RefreshToken from './RefreshTokenModel'
import User from './UserModel'

associations()

// Sync all models with the database
sequelize
    .authenticate()
    .then(() => {
        console.log('\x1b[36m%s\x1b[0m', 'Database authenticated successfully.')
        return sequelize.sync({ alter: true })
    })
    .then(() => {
        console.log('\x1b[36m%s\x1b[0m', 'All models were synchronized successfully.')
    })
    .catch((err) => console.error('Sync failed:', err))

// Export all models
export { RefreshToken, User }

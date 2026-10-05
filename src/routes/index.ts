import { Express, Request, Response } from 'express'

import authRoute from './auth'
import adminRoute from './admin'
import emathRoute from './emath'
import meRoute from './me'
import parentRoute from './parent'
import profileRoute from './profile'
import errorHandler from '~/app/errors/errorHandler'
import setUserContextMiddleware from '~/app/middlewares/userContext'

const route = (app: Express) => {
    app.use(setUserContextMiddleware)

    app.use('/api/auth', authRoute)
    app.use('/api/admin', adminRoute)
    app.use('/api/me', meRoute)
    app.use('/api/parent', parentRoute)
    app.use('/api/profiles', profileRoute)
    app.use('/api/emath', emathRoute)
    app.use('/api', emathRoute)

    app.all('*', (req: Request, res: Response) => {
        res.status(404).json({
            status: 404,
            message: `Can't find ${req.originalUrl} on this server!`,
        })
    })

    app.use(errorHandler)
}

export default route

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import admin from 'firebase-admin'
import http from 'http'
import morgan from 'morgan'

import './config/env'
import setupGlobalErrorHandling from './app/errors/globalError'
import SocketConfig from './config/socket/index'
import setupSocketConnection from './socket'
setupGlobalErrorHandling()

import 'express-async-errors'
import './app/queue'
import * as database from './config/database/index'
import associations from './app/models/association'
import serviceAccount from './config/firebase/serviceAccount'
import { redisClient } from './config/redis'
import route from './routes/index'
const app = express()
const server = http.createServer(app)

const allowedOrigins: string[] = ['http://localhost:8081', 'http://localhost:3000']

const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Cho phép mọi request trong môi trường phát triển / mobile LAN
        if (!origin || process.env.NODE_ENV === 'development') return callback(null, true)

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(null, true) // Cho phép kết nối từ ứng dụng di động trong mạng nội bộ
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'x-requested-with',
        'Accept',
        'x-refresh-token',
        'X-Refresh-Token',
    ],
    exposedHeaders: ['X-Refresh-Token-Required', 'x-refresh-token-required'],
    credentials: true,
    maxAge: 86400,
}

app.use(cors(corsOptions))

if (serviceAccount.project_id) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
}

// connect to db
database.connect()
associations()

// connect to redis
;(async () => {
    await redisClient.connect()
})()

// create s3 bucket (We are using R2, so we don't create buckets automatically.)
// ;(async () => {
//     await initializeBucket()
// })()

app.use(
    express.urlencoded({
        extended: true,
    }),
)

app.use(express.json())
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// make express trust the proxy of the load balancer (nginx)
// so that we can get the correct protocol and host from the request
app.set('trust proxy', 1)

route(app)

const io = SocketConfig.init(server, allowedOrigins)

// setup socket connection
setupSocketConnection(io)

const PORT = Number(process.env.PORT) || 6001
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} (0.0.0.0 - all network interfaces)`)
})

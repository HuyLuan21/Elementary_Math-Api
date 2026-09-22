import http from 'http'
import { Server } from 'socket.io'

import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from '~/types/socket.type'

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>

class SocketConfig {
    init = (
        httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
        allowedOrigins: string[],
    ) => {
        io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>(httpServer, {
            cors: {
                origin: function (origin, callback) {
                    if (!origin) return callback(null, true)
                    if (
                        process.env.NODE_ENV !== 'production' ||
                        allowedOrigins.includes(origin) ||
                        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
                        /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)
                    ) {
                        callback(null, true)
                    } else {
                        callback(new Error('CORS not allowed by server'))
                    }
                },
                credentials: true,
            },
        })

        return io
    }

    getIO = () => {
        if (!io) {
            throw new Error('IO not initialized')
        }
        return io
    }
}

export default new SocketConfig()

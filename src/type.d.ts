import { Request } from 'express'

import { UserRole } from './types/user.type'

export interface IRequest extends Request {
    decoded?: string | JwtPayload
    role?: UserRole
}

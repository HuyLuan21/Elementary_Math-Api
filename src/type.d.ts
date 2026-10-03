import { Request } from 'express'

import { AuthTokenPayload, UserRole } from './types/user.type'

export interface IRequest extends Request {
    decoded?: AuthTokenPayload
    role?: UserRole
}

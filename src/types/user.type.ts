import { JwtPayload } from 'jsonwebtoken'

export type UserRole = 'parent' | 'admin'

export interface AuthTokenPayload extends JwtPayload {
	sub: string
	role: UserRole
}

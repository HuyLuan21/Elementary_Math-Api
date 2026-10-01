import { Request, Response } from 'express'
import psl from 'psl'

interface IClearCookie {
    res: Response
    cookies: string[]
    path?: string
    req: Request
}

const getParentDomain = (hostname: string): string => {
    const parsed = psl.parse(hostname)

    // if parsed.domain is not undefined, return parsed.domain
    if ('domain' in parsed && parsed.domain) {
        return parsed.domain
    }

    return hostname
}

const getCookieOptions = (req: Request, path: string, maxAge?: number) => {
    const isProduction = process.env.NODE_ENV === 'production'
    const origin = req.headers.origin || req.headers.referer
    const hostname = origin ? new URL(origin).hostname : undefined
    const domain = isProduction && hostname ? `.${getParentDomain(hostname)}` : undefined

    return {
        httpOnly: true,
        path,
        sameSite: isProduction ? ('none' as const) : ('lax' as const),
        secure: isProduction,
        ...(isProduction ? { partitioned: true } : {}),
        ...(domain ? { domain } : {}),
        ...(maxAge !== undefined ? { maxAge } : {}),
    }
}

const getTokenMaxAge = (name: string) => {
    const seconds = Number(name === 'access_token' ? process.env.EXPIRED_TOKEN : process.env.EXPIRED_REFRESH_TOKEN)
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined
}

export const clearCookie = ({ res, cookies = [], path = '/', req }: IClearCookie) => {
    for (const cookie of cookies) {
        res.cookie(cookie, '', getCookieOptions(req, path, 0))
    }
}

interface ISetCookie {
    res: Response
    cookies: { name: string; value: string }[]
    path?: string
    req: Request
}

export const setCookie = ({ res, cookies = [], path = '/', req }: ISetCookie) => {
    for (const cookie of cookies) {
        res.cookie(cookie.name, cookie.value, getCookieOptions(req, path, getTokenMaxAge(cookie.name)))
    }
}

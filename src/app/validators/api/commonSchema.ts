import { z } from 'zod'

import { TypedRequest } from '~/types/request.type'

export const emailSchema = z.email('Email không hợp lệ')

export const paginationSchema = z.object({
    query: z.object({
        page: z.coerce.number({ error: 'Page không hợp lệ' }).min(1).transform(String),
        per_page: z.coerce.number({ error: 'Per page không hợp lệ' }).min(1).transform(String),
    }),
})

export const idSchema = z.object({
    params: z.object({
        id: z.coerce
            .number({ error: 'Id không hợp lệ' })
            .int({ error: 'Id phải là số nguyên' })
            .positive({ error: 'Id phải là số dương' })
            .transform(String),
    }),
})

export const uuidSchema = z.object({
    params: z.object({
        uuid: z.uuidv4(),
    }),
})

export type PaginationRequest = TypedRequest<any, any, z.infer<typeof paginationSchema>['query']>
export type IdRequest = TypedRequest<any, z.infer<typeof idSchema>['params']>
export type UuidRequest = TypedRequest<any, z.infer<typeof uuidSchema>['params']>

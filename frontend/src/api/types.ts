export type Session = {
    token: string
    refreshToken: string
}

export type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    auth?: boolean
}

export type RequestFn = <T = void>(path: string, options?: RequestOptions) => Promise<T>

export class ApiError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

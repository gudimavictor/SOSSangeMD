export type Session = {
    token: string
    refreshToken: string
}

export type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    /** false = cerere publică, fără token JWT. */
    auth?: boolean
}

/** Funcția prin care domeniile (auth, requests etc.) trimit cereri prin instanța axios din provider. */
export type RequestFn = <T = void>(path: string, options?: RequestOptions) => Promise<T>

export class ApiError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

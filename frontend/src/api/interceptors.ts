import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { SESSION_EXPIRED_EVENT, clearSession, getSession, saveSession } from './session'
import { ApiError } from './types'

type RequestConfig = InternalAxiosRequestConfig & { _retried?: boolean; _public?: boolean }

let refreshInFlight: Promise<boolean> | null = null

// Folosește axios „gol", ca cererea de refresh să nu treacă prin interceptorii instanței.
function tryRefresh(baseURL: string): Promise<boolean> {
    const session = getSession()
    if (!session) return Promise.resolve(false)

    refreshInFlight ??= axios
        .post<{ token: string; refreshToken: string }>(`${baseURL}/api/auth/refresh`, {
            refreshToken: session.refreshToken,
        })
        .then((res) => {
            saveSession({ token: res.data.token, refreshToken: res.data.refreshToken })
            return true
        })
        .catch(() => false)
        .finally(() => {
            refreshInFlight = null
        })

    return refreshInFlight
}

function extractMessage(error: AxiosError): string {
    if (!error.response) {
        return 'Nu se poate contacta serverul. Verifică conexiunea și încearcă din nou.'
    }

    if (error.response.status >= 500) {
        return 'A apărut o eroare pe server. Încearcă din nou mai târziu.'
    }

    const data = error.response.data as unknown
    if (typeof data === 'string' && data) return data
    if (data && typeof data === 'object') {
        const body = data as { errors?: Record<string, string[]>; title?: string }
        const first = body.errors ? Object.values(body.errors).flat()[0] : undefined
        if (first) return first
        if (body.title) return body.title
    }
    return `Eroare ${error.response.status}`
}

export function setupInterceptors(client: AxiosInstance, baseURL: string): void {
    // Request: atașează tokenul JWT (mai puțin la cererile marcate ca publice).
    client.interceptors.request.use((config: RequestConfig) => {
        const session = getSession()
        if (session && !config._public) {
            config.headers.Authorization = `Bearer ${session.token}`
        }
        return config
    })

    // Response: la 401 reînnoiește tokenul o singură dată și reia cererea; altfel deloghează.
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config as RequestConfig | undefined

            if (error.response?.status === 401 && config && !config._public && !config._retried && getSession()) {
                config._retried = true
                if (await tryRefresh(baseURL)) {
                    return client(config)
                }
                clearSession()
                window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
            }

            throw new ApiError(error.response?.status ?? 0, extractMessage(error))
        },
    )
}

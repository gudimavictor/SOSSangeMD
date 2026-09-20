import type { CurrentUser } from '../features/auth/AuthContext'
import { mapUser } from './mappers'
import type { ApiUser } from './mappers'
import { clearSession, getSession, saveSession } from './session'
import type { RequestFn } from './types'

type LoginResponse = {
    token: string
    refreshToken: string
    user: ApiUser
}

export type RegisterData = {
    nume: string
    email: string
    parola: string
    telefon: string
    oras: string
    varsta: number
}

export const createAuthApi = (request: RequestFn) => ({
    sendVerificationCode(email: string): Promise<void> {
        return request('/api/auth/send-verification-code', { method: 'POST', body: { email }, auth: false })
    },

    confirmCode(email: string, code: string): Promise<void> {
        return request('/api/auth/confirm-code', { method: 'POST', body: { email, code }, auth: false })
    },

    async register(data: RegisterData): Promise<void> {
        await request('/api/auth/register', {
            method: 'POST',
            auth: false,
            body: {
                name: data.nume,
                email: data.email,
                password: data.parola,
                phone: data.telefon,
                city: data.oras,
                age: data.varsta,
                isDonor: false,
                bloodType: null,
                lastDonationDate: null,
            },
        })
    },

    async login(email: string, password: string): Promise<CurrentUser> {
        const res = await request<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: { email, password },
            auth: false,
        })
        saveSession({ token: res.token, refreshToken: res.refreshToken })
        return mapUser(res.user)
    },

    async logout(): Promise<void> {
        const session = getSession()
        clearSession()
        if (!session) return
        try {
            await request('/api/auth/logout', { method: 'POST', body: { refreshToken: session.refreshToken }, auth: false })
        } catch {
            // Sesiunea locală e deja ștearsă; dacă revocarea eșuează, tokenul expiră oricum.
        }
    },
})

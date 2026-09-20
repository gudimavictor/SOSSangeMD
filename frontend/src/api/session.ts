import type { Session } from './types'

const SESSION_KEY = 'sos-sange-session'
export const SESSION_EXPIRED_EVENT = 'sos-sange-session-expired'

export function getSession(): Session | null {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as Session
    } catch {
        return null
    }
}

export function saveSession(session: Session): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
    localStorage.removeItem(SESSION_KEY)
}

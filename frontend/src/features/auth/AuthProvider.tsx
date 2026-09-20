import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { CurrentUser } from './AuthContext'
import { useApi } from '../../api/use-api'
import { SESSION_EXPIRED_EVENT, getSession } from '../../api/session'

const STORAGE_KEY = 'sos-sange-current-user'

function loadUser(): CurrentUser | null {
    if (!getSession()) return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as CurrentUser
    } catch {
        return null
    }
}

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const api = useApi()
    const [user, setUser] = useState<CurrentUser | null>(loadUser)

    useEffect(() => {
        function handleExpired() {
            localStorage.removeItem(STORAGE_KEY)
            setUser(null)
        }
        window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    }, [])

    async function login(email: string, password: string) {
        const loggedIn = await api.auth.login(email, password)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn))
        setUser(loggedIn)
    }

    async function logout() {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        await api.auth.logout()
    }

    function updateUser(updates: Partial<CurrentUser>) {
        setUser((prev) => {
            if (!prev) return prev
            const updated = { ...prev, ...updates }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

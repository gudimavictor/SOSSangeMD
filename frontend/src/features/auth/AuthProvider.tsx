import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { CurrentUser } from './AuthContext'

const STORAGE_KEY = 'sos-sange-current-user'

function loadUser(): CurrentUser | null {
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
    const [user, setUser] = useState<CurrentUser | null>(loadUser)

    function login(newUser: CurrentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
        setUser(newUser)
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY)
        setUser(null)
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
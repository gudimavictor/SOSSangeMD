import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type GrupaSanguina = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'

export type CurrentUser = {
    id: string
    nume: string
    email: string
    telefon: string
    oras: string
    esteDonator: boolean
    grupaSanguina: GrupaSanguina | null
    dataUltimeiDonari: string | null
}

type AuthContextValue = {
    user: CurrentUser | null
    login: (user: CurrentUser) => void
    logout: () => void
    updateUser: (updates: Partial<CurrentUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

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

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth trebuie folosit in interiorul AuthProvider')
    }
    return ctx
}
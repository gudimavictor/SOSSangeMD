import { createContext, useContext } from 'react'

export type GrupaSanguina = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'

export type CurrentUser = {
    id: string
    nume: string
    email: string
    telefon: string
    oras: string
    varsta: number | null
    esteDonator: boolean
    esteAdmin: boolean
    grupaSanguina: GrupaSanguina | null
    dataUltimeiDonari: string | null
}

export type AuthContextValue = {
    user: CurrentUser | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    updateUser: (updates: Partial<CurrentUser>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth trebuie folosit in interiorul AuthProvider')
    }
    return ctx
}
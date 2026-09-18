import type { GrupaSanguina } from './AuthContext'

export type UserRecord = {
    id: string
    nume: string
    email: string
    parola: string
    telefon: string
    oras: string
    varsta: number | null
    esteDonator: boolean
    esteAdmin: boolean
    grupaSanguina: GrupaSanguina | null
    dataUltimeiDonari: string | null
}

const USERS_KEY = 'sos-sange-users'

export function getUsers(): UserRecord[] {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as UserRecord[]
    } catch {
        return []
    }
}

export function findUserByEmail(email: string): UserRecord | undefined {
    return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function addUser(user: UserRecord): void {
    const users = getUsers()
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function hashParola(parola: string): Promise<string> {
    const data = new TextEncoder().encode(parola)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

export function updateUser(id: string, updates: Partial<UserRecord>): void {
    const users = getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index !== -1) {
        users[index] = { ...users[index], ...updates }
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
}

export function deleteUser(id: string): void {
    const users = getUsers().filter((u) => u.id !== id)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function setAdmin(id: string, esteAdmin: boolean): void {
    updateUser(id, { esteAdmin })
}
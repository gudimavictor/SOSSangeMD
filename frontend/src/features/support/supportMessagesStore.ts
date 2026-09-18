export type SupportMessage = {
    id: string
    userId: string | null
    nume: string
    email: string
    mesaj: string
    data: string
    citit: boolean
    raspuns: string | null
    raspunsData: string | null
}

const MESSAGES_KEY = 'sos-sange-support-messages'

export function getSupportMessages(): SupportMessage[] {
    const raw = localStorage.getItem(MESSAGES_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as SupportMessage[]
    } catch {
        return []
    }
}

export function addSupportMessage(message: SupportMessage): void {
    const messages = getSupportMessages()
    messages.push(message)
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

export function raspundeMesaj(id: string, raspuns: string): void {
    const messages = getSupportMessages()
    const index = messages.findIndex((m) => m.id === id)
    if (index !== -1) {
        messages[index] = {
            ...messages[index],
            citit: true,
            raspuns,
            raspunsData: new Date().toISOString(),
        }
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    }
}

export function deleteSupportMessage(id: string): void {
    const messages = getSupportMessages().filter((m) => m.id !== id)
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

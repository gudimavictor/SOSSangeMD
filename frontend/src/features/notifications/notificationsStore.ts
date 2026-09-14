export type TipNotificare = 'confirmare' | 'cerere_compatibila'

export type NotificationLink = '/cererile-mele' | '/cereri-compatibile'

export type Notificare = {
    id: string
    userId: string
    tip: TipNotificare
    titlu: string
    mesaj: string
    citita: boolean
    data: string
    link?: NotificationLink
}

const NOTIFICATIONS_KEY = 'sos-sange-notifications'

export function getNotifications(): Notificare[] {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as Notificare[]
    } catch {
        return []
    }
}

export function getNotificationsByUser(userId: string): Notificare[] {
    return getNotifications()
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.data.localeCompare(a.data))
}

export function getUnreadCount(userId: string): number {
    return getNotifications().filter((n) => n.userId === userId && !n.citita).length
}

export function addNotification(n: Notificare): void {
    const all = getNotifications()
    all.push(n)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all))
}

export function markAsRead(id: string): void {
    const all = getNotifications()
    const index = all.findIndex((n) => n.id === id)
    if (index !== -1) {
        all[index] = { ...all[index], citita: true }
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all))
    }
}

export function markAllAsRead(userId: string): void {
    const all = getNotifications().map((n) => (n.userId === userId ? { ...n, citita: true } : n))
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all))
}
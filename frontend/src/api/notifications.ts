import type { Notificare, NotificationLink, TipNotificare } from '../features/notifications/types'
import type { ApiNotificationType } from './mappers'
import type { RequestFn } from './types'

export const NOTIFICATIONS_UPDATED_EVENT = 'sos-sange-notifications-updated'

type ApiNotification = {
    id: number
    userId: number
    type: ApiNotificationType
    title: string
    message: string
    isRead: boolean
    createdAt: string
    link: string | null
}

const typeFromApi: Record<ApiNotificationType, TipNotificare> = {
    Confirmation: 'confirmare',
    CompatibleRequest: 'cerere_compatibila',
    SupportReply: 'raspuns_suport',
}

function notifyChanged(): void {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
}

export const createNotificationsApi = (request: RequestFn) => ({
    async listMyNotifications(): Promise<Notificare[]> {
        const notifications = await request<ApiNotification[]>('/api/notifications/mine')
        return notifications.map((n) => ({
            id: String(n.id),
            userId: String(n.userId),
            tip: typeFromApi[n.type],
            titlu: n.title,
            mesaj: n.message,
            citita: n.isRead,
            data: n.createdAt,
            link: (n.link ?? undefined) as NotificationLink | undefined,
        }))
    },

    async markAsRead(id: string): Promise<void> {
        await request(`/api/notifications/mark-read/${id}`, { method: 'PUT' })
        notifyChanged()
    },

    async markAllAsRead(): Promise<void> {
        await request('/api/notifications/mark-all-read', { method: 'PUT' })
        notifyChanged()
    },
})

import type { SupportMessage } from '../features/support/types'
import type { RequestFn } from './types'

type ApiSupportMessage = {
    id: number
    userId: number
    userName: string
    userEmail: string
    message: string
    createdAt: string
    reply: string | null
    repliedAt: string | null
}

function mapMessage(m: ApiSupportMessage): SupportMessage {
    return {
        id: String(m.id),
        userId: String(m.userId),
        nume: m.userName,
        email: m.userEmail,
        mesaj: m.message,
        data: m.createdAt,
        raspuns: m.reply,
        raspunsData: m.repliedAt,
    }
}

export const createSupportApi = (request: RequestFn) => ({
    async createSupportMessage(message: string): Promise<void> {
        await request('/api/support/create', { method: 'POST', body: { message } })
    },

    async listSupportMessages(): Promise<SupportMessage[]> {
        const messages = await request<ApiSupportMessage[]>('/api/support/list')
        return messages.map(mapMessage)
    },

    async replySupportMessage(id: string, reply: string): Promise<void> {
        await request(`/api/support/reply/${id}`, { method: 'PUT', body: { reply } })
    },

    deleteSupportMessage(id: string): Promise<void> {
        return request(`/api/support/delete/${id}`, { method: 'DELETE' })
    },
})

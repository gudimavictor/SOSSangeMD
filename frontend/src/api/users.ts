import type { CurrentUser } from '../features/auth/AuthContext'
import { mapUser, userToApiBody } from './mappers'
import type { ApiUser } from './mappers'
import type { RequestFn } from './types'

export const createUsersApi = (request: RequestFn) => ({
    async listUsers(): Promise<CurrentUser[]> {
        const users = await request<ApiUser[]>('/api/users/list')
        return users.map(mapUser)
    },

    async updateUser(user: CurrentUser): Promise<CurrentUser> {
        return mapUser(await request<ApiUser>(`/api/users/update/${user.id}`, { method: 'PUT', body: userToApiBody(user) }))
    },

    deleteUser(id: string): Promise<void> {
        return request(`/api/users/delete/${id}`, { method: 'DELETE' })
    },

    changePassword(currentPassword: string, newPassword: string): Promise<void> {
        return request('/api/users/change-password', { method: 'PUT', body: { currentPassword, newPassword } })
    },
})

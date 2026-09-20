import type { GrupaSanguina } from '../features/auth/AuthContext'
import type { BloodRequest, NivelUrgenta } from '../features/requests/types'
import { mapRequest, requestToApiBody, toApiBloodType, toApiUrgency } from './mappers'
import type { ApiBloodRequest } from './mappers'
import type { RequestFn } from './types'

export type NewRequest = {
    grupaNecesara: GrupaSanguina
    oras: string
    urgenta: NivelUrgenta
    descriere: string
}

export const createRequestsApi = (request: RequestFn) => ({
    async listRequests(): Promise<BloodRequest[]> {
        const requests = await request<ApiBloodRequest[]>('/api/requests/list', { auth: false })
        return requests.map(mapRequest)
    },

    async listMyRequests(): Promise<BloodRequest[]> {
        const requests = await request<ApiBloodRequest[]>('/api/requests/mine')
        return requests.map(mapRequest)
    },

    async createRequest(data: NewRequest): Promise<BloodRequest> {
        const created = await request<ApiBloodRequest>('/api/requests/create', {
            method: 'POST',
            body: {
                requiredBloodType: toApiBloodType(data.grupaNecesara),
                city: data.oras,
                urgency: toApiUrgency(data.urgenta),
                description: data.descriere,
            },
        })
        return mapRequest(created)
    },

    async updateRequest(bloodRequest: BloodRequest): Promise<BloodRequest> {
        const updated = await request<ApiBloodRequest>(`/api/requests/update/${bloodRequest.id}`, {
            method: 'PUT',
            body: requestToApiBody(bloodRequest),
        })
        return mapRequest(updated)
    },

    deleteRequest(id: string): Promise<void> {
        return request(`/api/requests/delete/${id}`, { method: 'DELETE' })
    },
})

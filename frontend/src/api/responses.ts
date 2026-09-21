import type { GrupaSanguina } from '../features/auth/AuthContext'
import type { StatusRaspuns } from '../features/requests/types'
import { fromApiBloodType, fromApiResponseStatus, responseStatusToApi } from './mappers'
import type { ApiBloodType, ApiResponseStatus } from './mappers'
import type { RequestFn } from './types'

type ApiMyResponse = {
    id: number
    bloodRequestId: number
    requesterId: number
    requesterName: string
    requesterPhone: string
    status: ApiResponseStatus
    respondedAt: string
}

type ApiDonorContact = {
    id: number
    donorId: number
    donorName: string
    donorBloodType: ApiBloodType | null
    donorPhone: string
    status: ApiResponseStatus
    respondedAt: string
}

export type MyResponse = {
    id: string
    cererId: string
    solicitantId: string
    solicitantNume: string
    solicitantTelefon: string
    status: StatusRaspuns
    data: string
}

export type DonorContact = {
    id: string
    donatorId: string
    donatorNume: string
    grupaSanguina: GrupaSanguina | null
    telefon: string
    status: StatusRaspuns
    data: string
}

export const createResponsesApi = (request: RequestFn) => ({
    async listMyResponses(): Promise<MyResponse[]> {
        const responses = await request<ApiMyResponse[]>('/api/responses/mine')
        return responses.map((r) => ({
            id: String(r.id),
            cererId: String(r.bloodRequestId),
            solicitantId: String(r.requesterId),
            solicitantNume: r.requesterName,
            solicitantTelefon: r.requesterPhone,
            status: fromApiResponseStatus(r.status),
            data: r.respondedAt,
        }))
    },

    async listResponsesByRequest(requestId: string): Promise<DonorContact[]> {
        const responses = await request<ApiDonorContact[]>(`/api/responses/by-request/${requestId}`)
        return responses.map((r) => ({
            id: String(r.id),
            donatorId: String(r.donorId),
            donatorNume: r.donorName,
            grupaSanguina: r.donorBloodType ? fromApiBloodType(r.donorBloodType) : null,
            telefon: r.donorPhone,
            status: fromApiResponseStatus(r.status),
            data: r.respondedAt,
        }))
    },

    async createResponse(requestId: string, status: StatusRaspuns = 'disponibil'): Promise<void> {
        await request('/api/responses/create', {
            method: 'POST',
            body: { bloodRequestId: Number(requestId), status: responseStatusToApi[status] },
        })
    },
})

import type { CentruTransfuzie } from '../features/centers/centers'
import type { RequestFn } from './types'

type ApiCenter = {
    id: number
    name: string
    city: string
    address: string
    phone: string
    schedule: string
    lat: number
    lng: number
}

function mapCenter(c: ApiCenter): CentruTransfuzie {
    return {
        id: String(c.id),
        nume: c.name,
        oras: c.city,
        adresa: c.address,
        telefon: c.phone,
        program: c.schedule,
        lat: c.lat,
        lng: c.lng,
    }
}

function toBody(c: Omit<CentruTransfuzie, 'id'>) {
    return {
        name: c.nume,
        city: c.oras,
        address: c.adresa,
        phone: c.telefon,
        schedule: c.program,
        lat: c.lat,
        lng: c.lng,
    }
}

export const createCentersApi = (request: RequestFn) => ({
    async listCenters(): Promise<CentruTransfuzie[]> {
        const centers = await request<ApiCenter[]>('/api/centers/list', { auth: false })
        return centers.map(mapCenter)
    },

    async createCenter(center: Omit<CentruTransfuzie, 'id'>): Promise<CentruTransfuzie> {
        return mapCenter(await request<ApiCenter>('/api/centers/create', { method: 'POST', body: toBody(center) }))
    },

    async updateCenter(center: CentruTransfuzie): Promise<CentruTransfuzie> {
        return mapCenter(
            await request<ApiCenter>(`/api/centers/update/${center.id}`, { method: 'PUT', body: toBody(center) }),
        )
    },

    deleteCenter(id: string): Promise<void> {
        return request(`/api/centers/delete/${id}`, { method: 'DELETE' })
    },
})

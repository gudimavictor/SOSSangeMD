import type { BloodRequest, StatusCerere } from './types'

const REQUESTS_KEY = 'sos-sange-requests'

export function getRequests(): BloodRequest[] {
    const raw = localStorage.getItem(REQUESTS_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as BloodRequest[]
    } catch {
        return []
    }
}

export function getRequestsByUser(userId: string): BloodRequest[] {
    return getRequests()
        .filter((r) => r.solicitantId === userId)
        .sort((a, b) => b.dataCreare.localeCompare(a.dataCreare))
}

export function addRequest(request: BloodRequest): void {
    const requests = getRequests()
    requests.push(request)
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}

export function updateRequestStatus(id: string, status: StatusCerere): void {
    const requests = getRequests()
    const index = requests.findIndex((r) => r.id === id)
    if (index !== -1) {
        requests[index] = { ...requests[index], status }
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
    }
}

export function deleteRequest(id: string): void {
    const requests = getRequests().filter((r) => r.id !== id)
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}
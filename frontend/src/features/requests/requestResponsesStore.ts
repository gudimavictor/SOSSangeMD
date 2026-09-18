import type { RequestResponse, StatusRaspuns } from './types'

const RESPONSES_KEY = 'sos-sange-responses'

export function getResponses(): RequestResponse[] {
    const raw = localStorage.getItem(RESPONSES_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as RequestResponse[]
    } catch {
        return []
    }
}

export function getResponsesByDonor(donatorId: string): RequestResponse[] {
    return getResponses().filter((r) => r.donatorId === donatorId)
}

export function getResponsesByRequest(cererId: string): RequestResponse[] {
    return getResponses().filter((r) => r.cererId === cererId)
}

export function aRaspunsDeja(cererId: string, donatorId: string): boolean {
    return getResponses().some((r) => r.cererId === cererId && r.donatorId === donatorId)
}

export function addResponse(response: RequestResponse): void {
    const responses = getResponses()
    responses.push(response)
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses))
}

export function updateResponseStatus(id: string, status: StatusRaspuns): void {
    const responses = getResponses()
    const index = responses.findIndex((r) => r.id === id)
    if (index !== -1) {
        responses[index] = { ...responses[index], status }
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses))
    }
}
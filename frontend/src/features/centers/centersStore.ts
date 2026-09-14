import type { CentruTransfuzie } from './centers'
import { centre as centreImplicite } from './centers'

const CENTERS_KEY = 'sos-sange-centers'

export function getCenters(): CentruTransfuzie[] {
    const raw = localStorage.getItem(CENTERS_KEY)
    if (!raw) {
        localStorage.setItem(CENTERS_KEY, JSON.stringify(centreImplicite))
        return centreImplicite
    }
    try {
        return JSON.parse(raw) as CentruTransfuzie[]
    } catch {
        return centreImplicite
    }
}

function salveaza(centre: CentruTransfuzie[]): void {
    localStorage.setItem(CENTERS_KEY, JSON.stringify(centre))
}

export function addCenter(centru: CentruTransfuzie): void {
    const centre = getCenters()
    centre.push(centru)
    salveaza(centre)
}

export function updateCenter(id: string, updates: Partial<CentruTransfuzie>): void {
    const centre = getCenters()
    const index = centre.findIndex((c) => c.id === id)
    if (index !== -1) {
        centre[index] = { ...centre[index], ...updates }
        salveaza(centre)
    }
}

export function deleteCenter(id: string): void {
    salveaza(getCenters().filter((c) => c.id !== id))
}
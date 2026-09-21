import type { GrupaSanguina } from '../auth/AuthContext'

const grupeCompatibile: Record<GrupaSanguina, GrupaSanguina[]> = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
}

export function esteCompatibil(grupaDonator: GrupaSanguina, grupaNecesara: GrupaSanguina): boolean {
    return grupeCompatibile[grupaNecesara].includes(grupaDonator)
}

export function esteEligibilPentruDonare(dataUltimeiDonari: string | null): boolean {
    if (!dataUltimeiDonari) return true

    const dataUrmatoare = new Date(dataUltimeiDonari)
    dataUrmatoare.setMonth(dataUrmatoare.getMonth() + 2)

    return new Date() >= dataUrmatoare
}

export function dataUrmatoareiDonari(dataUltimeiDonari: string): string {
    const d = new Date(dataUltimeiDonari)
    d.setMonth(d.getMonth() + 2)
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const grupeleSanguine: GrupaSanguina[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
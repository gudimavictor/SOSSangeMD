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

    const ultimaDonare = new Date(dataUltimeiDonari)
    const azi = new Date()
    const diferentaLuni =
        (azi.getFullYear() - ultimaDonare.getFullYear()) * 12 +
        (azi.getMonth() - ultimaDonare.getMonth())

    return diferentaLuni >= 2
}

export const grupeleSanguine: GrupaSanguina[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
import type { GrupaSanguina } from '../auth/AuthContext'

export type NivelUrgenta = 'critica' | 'urgenta' | 'programata'
export type StatusCerere = 'activa' | 'rezolvata' | 'expirata'

export type BloodRequest = {
    id: string
    solicitantId: string
    solicitantNume: string
    grupaNecesara: GrupaSanguina
    oras: string
    urgenta: NivelUrgenta
    descriere: string
    status: StatusCerere
    dataCreare: string
}

export type StatusRaspuns = 'disponibil' | 'indisponibil' | 'a_donat'

export type RequestResponse = {
    id: string
    cererId: string
    donatorId: string
    donatorNume: string
    status: StatusRaspuns
    data: string
}
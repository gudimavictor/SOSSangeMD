import type { CurrentUser, GrupaSanguina } from '../features/auth/AuthContext'
import type { BloodRequest, NivelUrgenta, StatusCerere, StatusRaspuns } from '../features/requests/types'

export type ApiBloodType = 'OMinus' | 'OPlus' | 'AMinus' | 'APlus' | 'BMinus' | 'BPlus' | 'ABMinus' | 'ABPlus'
export type ApiUrgency = 'Critical' | 'Urgent' | 'Scheduled'
export type ApiRequestStatus = 'Active' | 'Resolved' | 'Expired'
export type ApiResponseStatus = 'Available' | 'Unavailable' | 'Donated'
export type ApiNotificationType = 'Confirmation' | 'CompatibleRequest' | 'SupportReply'

const bloodTypeToApi: Record<GrupaSanguina, ApiBloodType> = {
    'O-': 'OMinus',
    'O+': 'OPlus',
    'A-': 'AMinus',
    'A+': 'APlus',
    'B-': 'BMinus',
    'B+': 'BPlus',
    'AB-': 'ABMinus',
    'AB+': 'ABPlus',
}

const bloodTypeFromApi = Object.fromEntries(
    Object.entries(bloodTypeToApi).map(([front, api]) => [api, front]),
) as Record<ApiBloodType, GrupaSanguina>

const urgencyToApi: Record<NivelUrgenta, ApiUrgency> = {
    critica: 'Critical',
    urgenta: 'Urgent',
    programata: 'Scheduled',
}

const urgencyFromApi: Record<ApiUrgency, NivelUrgenta> = {
    Critical: 'critica',
    Urgent: 'urgenta',
    Scheduled: 'programata',
}

const requestStatusToApi: Record<StatusCerere, ApiRequestStatus> = {
    activa: 'Active',
    rezolvata: 'Resolved',
    expirata: 'Expired',
}

const requestStatusFromApi: Record<ApiRequestStatus, StatusCerere> = {
    Active: 'activa',
    Resolved: 'rezolvata',
    Expired: 'expirata',
}

const responseStatusFromApi: Record<ApiResponseStatus, StatusRaspuns> = {
    Available: 'disponibil',
    Unavailable: 'indisponibil',
    Donated: 'a_donat',
}

export const responseStatusToApi: Record<StatusRaspuns, ApiResponseStatus> = {
    disponibil: 'Available',
    indisponibil: 'Unavailable',
    a_donat: 'Donated',
}

export const toApiBloodType = (g: GrupaSanguina): ApiBloodType => bloodTypeToApi[g]
export const fromApiBloodType = (b: ApiBloodType): GrupaSanguina => bloodTypeFromApi[b]
export const toApiUrgency = (u: NivelUrgenta): ApiUrgency => urgencyToApi[u]
export const toApiRequestStatus = (s: StatusCerere): ApiRequestStatus => requestStatusToApi[s]
export const fromApiResponseStatus = (s: ApiResponseStatus): StatusRaspuns => responseStatusFromApi[s]

export type ApiUser = {
    id: number
    name: string
    email: string
    phone: string
    city: string
    age: number | null
    isDonor: boolean
    isAdmin: boolean
    bloodType: ApiBloodType | null
    lastDonationDate: string | null
}

export function mapUser(u: ApiUser): CurrentUser {
    return {
        id: String(u.id),
        nume: u.name,
        email: u.email,
        telefon: u.phone,
        oras: u.city,
        varsta: u.age,
        esteDonator: u.isDonor,
        esteAdmin: u.isAdmin,
        grupaSanguina: u.bloodType ? fromApiBloodType(u.bloodType) : null,
        dataUltimeiDonari: u.lastDonationDate,
    }
}

export function userToApiBody(u: CurrentUser) {
    return {
        name: u.nume,
        email: u.email,
        phone: u.telefon,
        city: u.oras,
        age: u.varsta,
        isDonor: u.esteDonator,
        isAdmin: u.esteAdmin,
        bloodType: u.grupaSanguina ? toApiBloodType(u.grupaSanguina) : null,
        lastDonationDate: u.dataUltimeiDonari,
    }
}

export type ApiBloodRequest = {
    id: number
    requesterId: number
    requesterName: string
    requiredBloodType: ApiBloodType
    city: string
    urgency: ApiUrgency
    description: string
    status: ApiRequestStatus
    createdAt: string
}

export function mapRequest(r: ApiBloodRequest): BloodRequest {
    return {
        id: String(r.id),
        solicitantId: String(r.requesterId),
        solicitantNume: r.requesterName,
        grupaNecesara: fromApiBloodType(r.requiredBloodType),
        oras: r.city,
        urgenta: urgencyFromApi[r.urgency],
        descriere: r.description,
        status: requestStatusFromApi[r.status],
        dataCreare: r.createdAt,
    }
}

export function requestToApiBody(r: BloodRequest) {
    return {
        requiredBloodType: toApiBloodType(r.grupaNecesara),
        city: r.oras,
        urgency: toApiUrgency(r.urgenta),
        description: r.descriere,
        status: toApiRequestStatus(r.status),
    }
}

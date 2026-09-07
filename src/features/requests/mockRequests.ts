import type { BloodRequest } from './types'

export const mockRequests: BloodRequest[] = [
    {
        id: 'r1',
        solicitantId: 'u1',
        solicitantNume: 'Ana Popescu',
        grupaNecesara: 'A-',
        oras: 'Chișinău',
        urgenta: 'critica',
        descriere: 'Intervenție chirurgicală urgentă, tatăl meu are nevoie de sânge azi.',
        status: 'activa',
        dataCreare: '2026-09-05',
    },
    {
        id: 'r2',
        solicitantId: 'u2',
        solicitantNume: 'Ion Rusu',
        grupaNecesara: 'O-',
        oras: 'Bălți',
        urgenta: 'urgenta',
        descriere: 'Nevoie de sânge pentru transfuzie, în următoarele 2 zile.',
        status: 'activa',
        dataCreare: '2026-09-04',
    },
    {
        id: 'r3',
        solicitantId: 'u3',
        solicitantNume: 'Maria Ciobanu',
        grupaNecesara: 'B+',
        oras: 'Chișinău',
        urgenta: 'programata',
        descriere: 'Operație programată peste 2 săptămâni, căutăm donatori din timp.',
        status: 'activa',
        dataCreare: '2026-09-01',
    },
]
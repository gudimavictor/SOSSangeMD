export type CentruTransfuzie = {
    id: string
    nume: string
    oras: string
    adresa: string
    telefon: string
    program: string
    lat: number
    lng: number
}

export const centre: CentruTransfuzie[] = [
    {
        id: 'chisinau',
        nume: 'Centrul Național de Transfuzie a Sângelui',
        oras: 'Chișinău',
        adresa: 'Str. Academiei 11, Chișinău',
        telefon: '+373 22 727 511',
        program: 'Luni–Vineri, 08:00–15:00',
        lat: 47.0159,
        lng: 28.8419,
    },
    {
        id: 'balti',
        nume: 'Centrul Național de Transfuzie a Sângelui — filiala Bălți',
        oras: 'Bălți',
        adresa: 'Str. Decebal 113, Bălți',
        telefon: '+373 231 22 555',
        program: 'Luni–Vineri, 08:00–14:00',
        lat: 47.7561,
        lng: 27.9298,
    },
    {
        id: 'cahul',
        nume: 'Cabinet de Transfuzie a Sângelui — Spitalul Raional Cahul',
        oras: 'Cahul',
        adresa: 'IMSP Spitalul Raional Cahul',
        telefon: '+373 299 22 555',
        program: 'Luni–Vineri, 08:00–14:00',
        lat: 45.9075,
        lng: 28.1936,
    },
    {
        id: 'soroca',
        nume: 'Cabinet de Transfuzie a Sângelui — Spitalul Raional Soroca "A. Prisăcari"',
        oras: 'Soroca',
        adresa: 'IMSP Spitalul Raional Soroca',
        telefon: '+373 230 22 555',
        program: 'Luni–Vineri, 08:00–14:00',
        lat: 48.1567,
        lng: 28.2939,
    },
    {
        id: 'comrat',
        nume: 'Cabinet de Transfuzie a Sângelui — Spitalul Raional Comrat "Isaac Gurfinchel"',
        oras: 'Comrat',
        adresa: 'Str. Odesscaia 2, Comrat',
        telefon: '+373 298 22 555',
        program: 'Luni–Vineri, 08:00–14:00',
        lat: 46.3021,
        lng: 28.6567,
    },
]
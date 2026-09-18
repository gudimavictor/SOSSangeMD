type EmailVerificationCode = {
    email: string
    cod: string
    creatLa: string
    expiraLa: string
    confirmatLa: string | null
}

const VERIFICARI_KEY = 'sos-sange-email-verification'
const DURATA_VALABILITATE_MINUTE = 10
const DURATA_CONFIRMARE_VALABILA_MINUTE = 30

function getVerificari(): EmailVerificationCode[] {
    const raw = localStorage.getItem(VERIFICARI_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as EmailVerificationCode[]
    } catch {
        return []
    }
}

function salveaza(verificari: EmailVerificationCode[]): void {
    localStorage.setItem(VERIFICARI_KEY, JSON.stringify(verificari))
}

export function genereazaCod(email: string): string {
    const cod = Math.floor(100000 + Math.random() * 900000).toString()
    const acum = new Date()
    const expira = new Date(acum.getTime() + DURATA_VALABILITATE_MINUTE * 60_000)

    const verificari = getVerificari()
    verificari.push({
        email,
        cod,
        creatLa: acum.toISOString(),
        expiraLa: expira.toISOString(),
        confirmatLa: null,
    })
    salveaza(verificari)

    return cod
}

export function confirmaCod(email: string, cod: string): boolean {
    const verificari = getVerificari()
    const acum = new Date()

    const index = verificari.findLastIndex(
        (v) => v.email === email && v.cod === cod && new Date(v.expiraLa) > acum,
    )
    if (index === -1) return false

    verificari[index].confirmatLa = acum.toISOString()
    salveaza(verificari)
    return true
}

export function emailEsteConfirmat(email: string): boolean {
    const acum = new Date()
    return getVerificari().some((v) => {
        if (v.email !== email || !v.confirmatLa) return false
        const confirmatLa = new Date(v.confirmatLa)
        const limita = new Date(confirmatLa.getTime() + DURATA_CONFIRMARE_VALABILA_MINUTE * 60_000)
        return acum < limita
    })
}

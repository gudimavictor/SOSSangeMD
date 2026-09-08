import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from './AuthContext'
import type { GrupaSanguina } from './AuthContext'
import { findUserByEmail, addUser } from './usersStore'
import './LoginPage.css'

type Mode = 'login' | 'inregistrare'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']
const grupeleSanguine: GrupaSanguina[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [mode, setMode] = useState<Mode>('login')
    const [nume, setNume] = useState('')
    const [email, setEmail] = useState('')
    const [parola, setParola] = useState('')
    const [confirmaParola, setConfirmaParola] = useState('')
    const [telefon, setTelefon] = useState('')
    const [oras, setOras] = useState(orase[0])
    const [grupaSanguina, setGrupaSanguina] = useState<GrupaSanguina | ''>('')
    const [eroare, setEroare] = useState('')

    function schimbaMode(newMode: Mode) {
        setMode(newMode)
        setEroare('')
    }

    function handleLogin(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        const user = findUserByEmail(email)

        if (!user || user.parola !== parola) {
            setEroare('Email sau parolă incorectă.')
            return
        }

        login({
            id: user.id,
            nume: user.nume,
            email: user.email,
            telefon: user.telefon,
            oras: user.oras,
            esteDonator: user.esteDonator,
            grupaSanguina: user.grupaSanguina,
            dataUltimeiDonari: user.dataUltimeiDonari,
        })
        navigate({ to: '/' })
    }

    function handleRegister(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        if (!nume || !email || !parola) {
            setEroare('Completează toate câmpurile obligatorii.')
            return
        }

        if (parola.length < 6) {
            setEroare('Parola trebuie să aibă minim 6 caractere.')
            return
        }

        if (parola !== confirmaParola) {
            setEroare('Parolele nu coincid.')
            return
        }

        if (findUserByEmail(email)) {
            setEroare('Există deja un cont cu acest email.')
            return
        }

        const newUser = {
            id: crypto.randomUUID(),
            nume,
            email,
            parola,
            telefon,
            oras,
            esteDonator: false,
            grupaSanguina: grupaSanguina || null,
            dataUltimeiDonari: null,
        }

        addUser(newUser)
        login({
            id: newUser.id,
            nume: newUser.nume,
            email: newUser.email,
            telefon: newUser.telefon,
            oras: newUser.oras,
            esteDonator: newUser.esteDonator,
            grupaSanguina: newUser.grupaSanguina,
            dataUltimeiDonari: newUser.dataUltimeiDonari,
        })
        navigate({ to: '/' })
    }

    return (
        <div className="loginPage">
            <h1 className="loginTitle">SOS Sânge MD</h1>
            <p className="loginSubtitle">
                {mode === 'login' ? 'Intră în contul tău' : 'Creează-ți un cont nou'}
            </p>

            <div className="loginCard">
                <div className="authTabs">
                    <button
                        type="button"
                        className={`authTab ${mode === 'login' ? 'authTabActive' : ''}`}
                        onClick={() => schimbaMode('login')}
                    >
                        Autentificare
                    </button>
                    <button
                        type="button"
                        className={`authTab ${mode === 'inregistrare' ? 'authTabActive' : ''}`}
                        onClick={() => schimbaMode('inregistrare')}
                    >
                        Înregistrare
                    </button>
                </div>

                {eroare && <p className="errorText">{eroare}</p>}

                {mode === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <div className="loginField">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ana@exemplu.md"
                                required
                            />
                        </div>
                        <div className="loginField">
                            <label htmlFor="parola">Parolă</label>
                            <input
                                id="parola"
                                type="password"
                                value={parola}
                                onChange={(e) => setParola(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="loginButton">
                            Autentifică-te
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister}>
                        <div className="loginField">
                            <label htmlFor="nume">Nume complet</label>
                            <input
                                id="nume"
                                type="text"
                                value={nume}
                                onChange={(e) => setNume(e.target.value)}
                                placeholder="Ana Popescu"
                                required
                            />
                        </div>
                        <div className="loginField">
                            <label htmlFor="email-r">Email</label>
                            <input
                                id="email-r"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ana@exemplu.md"
                                required
                            />
                        </div>
                        <div className="loginField">
                            <label htmlFor="telefon">Telefon</label>
                            <input
                                id="telefon"
                                type="text"
                                value={telefon}
                                onChange={(e) => setTelefon(e.target.value)}
                                placeholder="+373 69 123 456"
                            />
                        </div>
                        <div className="loginField">
                            <label htmlFor="oras">Oraș</label>
                            <select id="oras" value={oras} onChange={(e) => setOras(e.target.value)}>
                                {orase.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="loginField">
                            <label htmlFor="grupaSanguina">Grupa sanguină (opțional)</label>
                            <select
                                id="grupaSanguina"
                                value={grupaSanguina}
                                onChange={(e) => setGrupaSanguina(e.target.value as GrupaSanguina | '')}
                            >
                                <option value="">Nu știu / prefer să nu spun</option>
                                {grupeleSanguine.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="loginField">
                            <label htmlFor="parola-r">Parolă</label>
                            <input
                                id="parola-r"
                                type="password"
                                value={parola}
                                onChange={(e) => setParola(e.target.value)}
                                placeholder="Minim 6 caractere"
                                required
                            />
                        </div>
                        <div className="loginField">
                            <label htmlFor="confirmaParola">Confirmă parola</label>
                            <input
                                id="confirmaParola"
                                type="password"
                                value={confirmaParola}
                                onChange={(e) => setConfirmaParola(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="loginButton">
                            Creează cont
                        </button>
                    </form>
                )}

                <p className="loginNote">
                    Datele sunt salvate momentan local, în browser — vor fi conectate la un server real ulterior.
                </p>
            </div>
        </div>
    )
}
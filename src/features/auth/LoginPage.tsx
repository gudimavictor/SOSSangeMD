import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from './AuthContext'
import { findUserByEmail, addUser } from './usersStore'
import { CustomSelect } from '../../components/ui/CustomSelect'
import './LoginPage.css'

type Mode = 'login' | 'inregistrare'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

function IconEye() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function IconEyeOff() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    )
}

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as { redirect?: string }
    const redirectTo = search.redirect || '/'

    const [mode, setMode] = useState<Mode>('login')
    const [nume, setNume] = useState('')
    const [email, setEmail] = useState('')
    const [parola, setParola] = useState('')
    const [confirmaParola, setConfirmaParola] = useState('')
    const [telefon, setTelefon] = useState('')
    const [oras, setOras] = useState('')
    const [varsta, setVarsta] = useState('')
    const [confirmVarsta, setConfirmVarsta] = useState(false)
    const [eroare, setEroare] = useState('')
    const [aratParola, setAratParola] = useState(false)
    const [aratParolaR, setAratParolaR] = useState(false)
    const [aratConfirmare, setAratConfirmare] = useState(false)

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
            varsta: user.varsta,
            esteDonator: user.esteDonator,
            grupaSanguina: user.grupaSanguina,
            dataUltimeiDonari: user.dataUltimeiDonari,
        })
        navigate({ to: redirectTo })
    }

    function handleRegister(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        if (!nume || !email || !parola || !oras || !varsta) {
            setEroare('Completează toate câmpurile obligatorii.')
            return
        }

        const varstaNumar = Number(varsta)

        if (!Number.isInteger(varstaNumar) || varstaNumar < 18) {
            setEroare('Trebuie să ai minim 18 ani pentru a-ți crea un cont.')
            return
        }

        if (varstaNumar > 100) {
            setEroare('Introdu o vârstă validă.')
            return
        }

        if (!confirmVarsta) {
            setEroare('Trebuie să confirmi că ai cel puțin 18 ani și că datele introduse sunt reale.')
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
            varsta: varstaNumar,
            esteDonator: false,
            grupaSanguina: null,
            dataUltimeiDonari: null,
        }

        addUser(newUser)
        login({
            id: newUser.id,
            nume: newUser.nume,
            email: newUser.email,
            telefon: newUser.telefon,
            oras: newUser.oras,
            varsta: newUser.varsta,
            esteDonator: newUser.esteDonator,
            grupaSanguina: newUser.grupaSanguina,
            dataUltimeiDonari: newUser.dataUltimeiDonari,
        })
        navigate({ to: redirectTo })
    }

    return (
        <div className="authShell">
            <div className="authVisual">
                <svg className="authVisualIcon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2C12 2 5 10.5 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10.5 12 2 12 2Z"
                        fill="white"
                    />
                </svg>
                <p className="authVisualTitle">Fiecare picătură contează</p>
                <p className="authVisualText">
                    Alătură-te comunității de donatori din Moldova și ajută-i pe cei care au nevoie urgentă de sânge.
                </p>
            </div>

            <div className="authFormSide">
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
                                    <div className="passwordWrapper">
                                        <input
                                            id="parola"
                                            type={aratParola ? 'text' : 'password'}
                                            value={parola}
                                            onChange={(e) => setParola(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setAratParola((prev) => !prev)}
                                        >
                                            {aratParola ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
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
                                    <label>Oraș</label>
                                    <CustomSelect
                                        options={orase}
                                        value={oras}
                                        onChange={setOras}
                                        placeholder="Selectează orașul"
                                    />
                                </div>
                                <div className="loginField">
                                    <label htmlFor="varsta">Vârsta</label>
                                    <input
                                        id="varsta"
                                        type="number"
                                        min={18}
                                        max={100}
                                        value={varsta}
                                        onChange={(e) => setVarsta(e.target.value)}
                                        placeholder="Ex: 25"
                                        required
                                    />
                                </div>
                                <div className="confirmField">
                                    <label className="confirmCheckboxLabel">
                                        <input
                                            type="checkbox"
                                            checked={confirmVarsta}
                                            onChange={(e) => setConfirmVarsta(e.target.checked)}
                                        />
                                        <span>
                                            Declar pe propria răspundere că am cel puțin 18 ani și că informațiile
                                            introduse sunt reale.
                                        </span>
                                    </label>
                                </div>
                                <div className="loginField">
                                    <label htmlFor="parola-r">Parolă</label>
                                    <div className="passwordWrapper">
                                        <input
                                            id="parola-r"
                                            type={aratParolaR ? 'text' : 'password'}
                                            value={parola}
                                            onChange={(e) => setParola(e.target.value)}
                                            placeholder="Minim 6 caractere"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setAratParolaR((prev) => !prev)}
                                        >
                                            {aratParolaR ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="loginField">
                                    <label htmlFor="confirmaParola">Confirmă parola</label>
                                    <div className="passwordWrapper">
                                        <input
                                            id="confirmaParola"
                                            type={aratConfirmare ? 'text' : 'password'}
                                            value={confirmaParola}
                                            onChange={(e) => setConfirmaParola(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setAratConfirmare((prev) => !prev)}
                                        >
                                            {aratConfirmare ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
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
            </div>
        </div>
    )
}
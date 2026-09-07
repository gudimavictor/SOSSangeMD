import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from './AuthContext'
import './LoginPage.css'

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [nume, setNume] = useState('')
    const [email, setEmail] = useState('')
    const [telefon, setTelefon] = useState('')
    const [oras, setOras] = useState('')

    function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (!nume || !email) return

        login({
            id: crypto.randomUUID(),
            nume,
            email,
            telefon,
            oras,
            esteDonator: false,
            grupaSanguina: null,
            dataUltimeiDonari: null,
        })

        navigate({ to: '/' })
    }

    return (
        <div className="loginPage">
            <h1 className="loginTitle">SOS Sânge MD</h1>
            <p className="loginSubtitle">Intră în cont pentru a solicita sau a dona sânge</p>

            <div className="loginCard">
                <form onSubmit={handleSubmit}>
                    <div className="loginField">
                        <label htmlFor="nume">Nume complet</label>
                        <input
                            id="nume"
                            type="text"
                            value={nume}
                            onChange={(e) => setNume(e.target.value)}
                            placeholder="Ex: Ana Popescu"
                            required
                        />
                    </div>

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
                        <input
                            id="oras"
                            type="text"
                            value={oras}
                            onChange={(e) => setOras(e.target.value)}
                            placeholder="Chișinău"
                        />
                    </div>

                    <button type="submit" className="loginButton">
                        Intră în cont
                    </button>
                </form>

                <p className="loginNote">
                    Momentan nu există verificare de parolă — cont simplificat pentru testare.
                </p>
            </div>
        </div>
    )
}
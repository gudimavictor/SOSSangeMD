import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../auth/AuthContext'
import type { GrupaSanguina } from '../auth/AuthContext'
import { updateUser as updateUserRecord } from '../auth/usersStore'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { CustomDatePicker } from '../../components/ui/CustomDatePicker.tsx'
import { esteCompatibil, esteEligibilPentruDonare, grupeleSanguine } from '../requests/compatibilitate'
import { mockRequests } from '../requests/mockRequests'
import './DonorPage.css'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

function formateazaData(data: string) {
    return new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dataUrmatoareiDonari(dataUltimeiDonari: string) {
    const d = new Date(dataUltimeiDonari)
    d.setMonth(d.getMonth() + 2)
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function DonorPage() {
    const { user, updateUser } = useAuth()

    const [editMode, setEditMode] = useState(false)
    const [grupa, setGrupa] = useState(user?.grupaSanguina ?? '')
    const [oras, setOras] = useState(user?.oras ?? '')
    const [dataDonare, setDataDonare] = useState(user?.dataUltimeiDonari ?? '')

    if (!user) {
        return (
            <div className="donorPage">
                <div className="donorHero">
                    <h1 className="donorHeroTitle">Devino donator de sânge</h1>
                    <p className="donorHeroSubtitle">
                        Un singur cont — poți atât să ceri sânge, cât și să donezi, oricând ai nevoie.
                    </p>
                </div>

                <div className="donorBody">
                    <div className="donorLoginPrompt">
                        <p>Trebuie să fii autentificat ca să te înregistrezi ca donator.</p>
                        <Link to="/login" search={{ redirect: '/sunt-donator' }} className="donorCta">
                            Autentifică-te
                        </Link>
                    </div>

                    <div className="eligibilityCard">
                        <p className="eligibilityTitle">Cine poate dona sânge?</p>
                        <ul className="eligibilityList">
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Vârsta între 18 și 60 de ani
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Greutate minimă de 50 kg
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Stare generală bună de sănătate
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Au trecut minim 2 luni de la ultima donare
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!grupa || !oras) return

        const updates = {
            esteDonator: true,
            grupaSanguina: grupa as GrupaSanguina,
            oras,
            dataUltimeiDonari: dataDonare || null,
        }

        updateUser(updates)
        updateUserRecord(user!.id, updates)
        setEditMode(false)
    }

    function marcheazaDonareNoua() {
        const azi = new Date().toISOString().slice(0, 10)
        updateUser({ dataUltimeiDonari: azi })
        updateUserRecord(user!.id, { dataUltimeiDonari: azi })
    }

    if (!user.esteDonator || editMode) {
        return (
            <div className="donorPage">
                <div className="donorHero">
                    <h1 className="donorHeroTitle">
                        {user.esteDonator ? 'Editează profilul de donator' : 'Devino donator'}
                    </h1>
                    <p className="donorHeroSubtitle">
                        Completează datele tale, ca să apari pentru cei care au nevoie de sânge compatibil.
                    </p>
                </div>

                <div className="donorBody">
                    <div className="donorFormColumn">
                        <form className="donorForm" onSubmit={handleSubmit}>
                            <div className="donorFormRow">
                                <div className="formField">
                                    <label>Grupa ta sanguină</label>
                                    <CustomSelect
                                        options={grupeleSanguine}
                                        value={grupa}
                                        onChange={setGrupa}
                                        placeholder="Selectează grupa"
                                    />
                                </div>
                                <div className="formField">
                                    <label>Oraș</label>
                                    <CustomSelect
                                        options={orase}
                                        value={oras}
                                        onChange={setOras}
                                        placeholder="Selectează orașul"
                                    />
                                </div>
                            </div>

                            <div className="donorFormRow" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="formField">
                                    <label htmlFor="dataDonare">Data ultimei donări (opțional)</label>
                                    <CustomDatePicker
                                        value={dataDonare ?? ''}
                                        onChange={setDataDonare}
                                        placeholder="Selectează data"
                                        maxDate={new Date().toISOString().slice(0, 10)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="donorSubmitButton">
                                {user.esteDonator ? 'Salvează modificările' : 'Devino donator'}
                            </button>

                            {editMode && (
                                <button
                                    type="button"
                                    className="donorCancelButton"
                                    onClick={() => setEditMode(false)}
                                >
                                    Renunță
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    const eligibil = esteEligibilPentruDonare(user.dataUltimeiDonari)

    const cereriCompatibile = mockRequests.filter(
        (r) =>
            r.status === 'activa' &&
            user.grupaSanguina &&
            esteCompatibil(user.grupaSanguina, r.grupaNecesara) &&
            r.oras === user.oras
    )

    return (
        <div className="donorPage">
            <div className="donorHero">
                <h1 className="donorHeroTitle">Ești donator 🩸</h1>
                <p className="donorHeroSubtitle">Mulțumim! Profilul tău e vizibil pentru cei care au nevoie de sânge.</p>
            </div>

            <div className="donorBody">
                <div className="donorProfileCard">
                    <div className="donorProfileRow">
                        <div className="donorProfileItem">
                            <span className="donorProfileLabel">Grupa sanguină</span>
                            <span className="donorProfileValue donorGroupBadge">{user.grupaSanguina}</span>
                        </div>
                        <div className="donorProfileItem">
                            <span className="donorProfileLabel">Oraș</span>
                            <span className="donorProfileValue">{user.oras}</span>
                        </div>
                        <div className="donorProfileItem">
                            <span className="donorProfileLabel">Ultima donare</span>
                            <span className="donorProfileValue">
                                {user.dataUltimeiDonari ? formateazaData(user.dataUltimeiDonari) : 'Nicio donare încă'}
                            </span>
                        </div>
                    </div>

                    <div className={`donorEligibility ${eligibil ? 'donorEligibilityOk' : 'donorEligibilityWait'}`}>
                        {eligibil
                            ? '✓ Poți dona sânge acum'
                            : `Poți dona din nou pe ${dataUrmatoareiDonari(user.dataUltimeiDonari!)}`}
                    </div>

                    <div className="donorProfileActions">
                        <button className="donorSecondaryButton" onClick={() => setEditMode(true)}>
                            Editează profilul
                        </button>
                        <button className="donorSecondaryButton" onClick={marcheazaDonareNoua}>
                            Marchează o donare nouă
                        </button>
                    </div>
                </div>

                <h2 className="donorSectionTitle">Cereri compatibile cu tine</h2>

                {cereriCompatibile.length === 0 ? (
                    <p className="donorEmptyState">
                        Momentan nu există cereri active compatibile cu grupa și orașul tău.
                    </p>
                ) : (
                    <div className="donorRequestsList">
                        {cereriCompatibile.slice(0, 3).map((r) => (
                            <div key={r.id} className="donorRequestCard">
                                <div className="donorRequestTop">
                                    <span className="donorRequestGroup">{r.grupaNecesara}</span>
                                    <span className={`donorRequestUrgency donorRequestUrgency--${r.urgenta}`}>
                                        {r.urgenta}
                                    </span>
                                </div>
                                <p className="donorRequestDesc">{r.descriere}</p>
                                <span className="donorRequestCity">{r.oras}</span>
                            </div>
                        ))}
                    </div>
                )}

                <Link to="/cereri-compatibile" className="donorCta donorCtaLink">
                    Vezi toate cererile compatibile
                </Link>
            </div>
        </div>
    )
}
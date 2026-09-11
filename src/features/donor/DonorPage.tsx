import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import type { GrupaSanguina } from '../auth/AuthContext'
import { updateUser as updateUserRecord } from '../auth/usersStore'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { CustomDatePicker } from '../../components/ui/CustomDatePicker'
import { esteCompatibil, esteEligibilPentruDonare, grupeleSanguine } from '../requests/compatibilitate'
import { mockRequests } from '../requests/mockRequests'
import { IconCheck, IconDrop, IconLocation } from '../../components/ui/Icons'
import './DonorPage.css'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

function formateazaData(data: string) {
    return new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dataUrmatoareiDonari(dataUltimeiDonari: string) {
    const d = new Date(dataUltimeiDonari)
    d.setMonth(d.getMonth() + 2)
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function progresEligibilitate(dataUltimeiDonari: string | null) {
    if (!dataUltimeiDonari) return 100
    const ultima = new Date(dataUltimeiDonari)
    const azi = new Date()
    const zileTrecute = (azi.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24)
    const procent = Math.round((zileTrecute / 60) * 100)
    return Math.min(100, Math.max(0, procent))
}

export function DonorPage() {
    const { user, updateUser } = useAuth()

    const [editMode, setEditMode] = useState(false)
    const [grupa, setGrupa] = useState(user?.esteDonator ? user?.grupaSanguina ?? '' : '')
    const [oras, setOras] = useState(user?.esteDonator ? user?.oras ?? '' : '')
    const [dataDonare, setDataDonare] = useState(user?.dataUltimeiDonari ?? '')

    // ---------- Vizitator nelogat ----------
    if (!user) {
        return (
            <div className="donorPage">
                <div className="donorPageHeader">
                    <span className="donorEyebrow">Devino donator</span>
                    <h1 className="donorPageTitle">Devino donator de sânge</h1>
                    <p className="donorPageSubtitle">
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
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Vârsta între 18 și 60 de ani
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Greutate minimă de 50 kg
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Stare generală bună de sănătate
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
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

    // ---------- Formular înregistrare / editare profil donator ----------
    if (!user.esteDonator || editMode) {
        return (
            <div className="donorPage">
                <div className="donorPageHeader">
                    <span className="donorEyebrow">{user.esteDonator ? 'Editare profil' : 'Devino donator'}</span>
                    <h1 className="donorPageTitle">
                        {user.esteDonator ? 'Editează profilul de donator' : 'Devino donator'}
                    </h1>
                    <p className="donorPageSubtitle">
                        Completează datele tale, ca să apari pentru cei care au nevoie de sânge compatibil.
                    </p>
                </div>

                <div className="donorBody">
                    <div className="donorFormColumn">
                        <motion.form
                            className="donorForm"
                            onSubmit={handleSubmit}
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.div className="donorFormRow" variants={fadeUpItem}>
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
                            </motion.div>

                            <motion.div
                                className="donorFormRow"
                                style={{ gridTemplateColumns: '1fr' }}
                                variants={fadeUpItem}
                            >
                                <div className="formField">
                                    <label htmlFor="dataDonare">Data ultimei donări (opțional)</label>
                                    <CustomDatePicker
                                        value={dataDonare ?? ''}
                                        onChange={setDataDonare}
                                        placeholder="Selectează data"
                                        maxDate={new Date().toISOString().slice(0, 10)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={fadeUpItem}>
                                <motion.button
                                    type="submit"
                                    className="donorSubmitButton"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {user.esteDonator ? 'Salvează modificările' : 'Devino donator'}
                                </motion.button>

                                {editMode && (
                                    <button
                                        type="button"
                                        className="donorCancelButton"
                                        onClick={() => setEditMode(false)}
                                    >
                                        Renunță
                                    </button>
                                )}
                            </motion.div>
                        </motion.form>
                    </div>
                </div>
            </div>
        )
    }

    // ---------- Profil donator (deja donator) ----------
    const eligibil = esteEligibilPentruDonare(user.dataUltimeiDonari)
    const progres = progresEligibilitate(user.dataUltimeiDonari)

    const cereriCompatibile = mockRequests.filter(
        (r) =>
            r.status === 'activa' &&
            user.grupaSanguina &&
            esteCompatibil(user.grupaSanguina, r.grupaNecesara) &&
            r.oras === user.oras
    )

    return (
        <div className="donorPage">
            <div className="donorPageHeader">
                <span className="donorEyebrow iconText"><IconDrop /> Ești donator activ</span>
                <h1 className="donorPageTitle">Profilul tău de donator</h1>
                <p className="donorPageSubtitle">Mulțumim! Profilul tău e vizibil pentru cei care au nevoie de sânge.</p>
            </div>

            <div className="donorBody">
                <motion.div
                    className="donorProfileCard"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div className="donorProfileRow" variants={fadeUpItem}>
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
                    </motion.div>

                    <motion.div className="donorEligibilitySection" variants={fadeUpItem}>
                        <div className="donorEligibilityHeader">
                            <span className={`iconText ${eligibil ? 'donorEligibilityTextOk' : 'donorEligibilityTextWait'}`}>
                                {eligibil && <IconCheck />}
                                {eligibil
                                    ? 'Poți dona sânge acum'
                                    : `Poți dona din nou pe ${dataUrmatoareiDonari(user.dataUltimeiDonari!)}`}
                            </span>
                            <span className="donorEligibilityPercent">{progres}%</span>
                        </div>
                        <div className="donorProgressTrack">
                            <motion.div
                                className={`donorProgressFill ${eligibil ? 'donorProgressFillOk' : 'donorProgressFillWait'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progres}%` }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                        </div>
                    </motion.div>

                    <motion.div className="donorProfileActions" variants={fadeUpItem}>
                        <button className="donorSecondaryButton" onClick={() => setEditMode(true)}>
                            Editează profilul
                        </button>
                        <button className="donorSecondaryButton" onClick={marcheazaDonareNoua}>
                            Marchează o donare nouă
                        </button>
                    </motion.div>
                </motion.div>

                <h2 className="donorSectionTitle">Cereri compatibile cu tine</h2>

                {cereriCompatibile.length === 0 ? (
                    <p className="donorEmptyState">
                        Momentan nu există cereri active compatibile cu grupa și orașul tău.
                    </p>
                ) : (
                    <motion.div
                        className="donorRequestsList"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        {cereriCompatibile.slice(0, 3).map((r) => (
                            <motion.div
                                key={r.id}
                                className={`donorRequestCard donorRequestCard--${r.urgenta}`}
                                variants={fadeUpItem}
                            >
                                <div className="donorRequestTop">
                                    <span className="donorRequestGroup">{r.grupaNecesara}</span>
                                    <span className={`donorRequestUrgency donorRequestUrgency--${r.urgenta}`}>
                                        {r.urgenta}
                                    </span>
                                </div>
                                <p className="donorRequestDesc">{r.descriere}</p>
                                <span className="donorRequestCity iconText"><IconLocation /> {r.oras}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                <Link to="/cereri-compatibile" className="donorCta donorCtaLink">
                    Vezi toate cererile compatibile
                </Link>
            </div>
        </div>
    )
}
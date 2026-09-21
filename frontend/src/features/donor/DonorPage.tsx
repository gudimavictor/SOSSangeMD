import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import type { CurrentUser, GrupaSanguina } from '../auth/AuthContext'
import { useApi } from '../../api/use-api'
import { useAsync } from '../../api/useAsync'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { CustomDatePicker } from '../../components/ui/CustomDatePicker'
import { CircularProgress } from '../../components/ui/CircularProgress'
import { PageHeader } from '../../components/ui/PageHeader'
import { esteCompatibil, esteEligibilPentruDonare, dataUrmatoareiDonari, grupeleSanguine } from '../requests/compatibilitate'
import { IconCheck, IconDrop, IconLocation, IconPhone } from '../../components/ui/Icons'
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
    const api = useApi()

    const [editMode, setEditMode] = useState(false)
    const [grupa, setGrupa] = useState(user?.esteDonator ? user?.grupaSanguina ?? '' : '')
    const [oras, setOras] = useState(user?.esteDonator ? user?.oras ?? '' : '')
    const [dataDonare, setDataDonare] = useState(user?.dataUltimeiDonari ?? '')
    const [eroare, setEroare] = useState('')
    const [seSalveaza, setSeSalveaza] = useState(false)

    const esteDonatorActiv = !!user?.esteDonator
    const { data: cereri, error: eroareCereri } = useAsync(
        () => api.requests.listRequests(),
        [user?.id ?? null],
        esteDonatorActiv,
    )
    const { data: raspunsuri, reload: reincarcaRaspunsuri } = useAsync(
        () => api.responses.listMyResponses(),
        [user?.id ?? null],
        esteDonatorActiv,
    )

    // ---------- Vizitator nelogat ----------
    if (!user) {
        return (
            <div className="donorPage">
                <PageHeader
                    className="donorPageHeader"
                    icon={<IconDrop />}
                    eyebrow="Devino donator"
                    title="Devino donator de sânge"
                    subtitle="Un singur cont — poți atât să ceri sânge, cât și să donezi, oricând ai nevoie."
                />

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

    const utilizator: CurrentUser = user

    async function salveazaUtilizator(updates: Partial<CurrentUser>) {
        setEroare('')
        setSeSalveaza(true)
        try {
            const salvat = await api.users.updateUser({ ...utilizator, ...updates })
            updateUser(salvat)
            return true
        } catch (e) {
            setEroare(e instanceof Error ? e.message : 'Datele nu au putut fi salvate.')
            return false
        } finally {
            setSeSalveaza(false)
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!grupa || !oras) return

        const salvat = await salveazaUtilizator({
            esteDonator: true,
            grupaSanguina: grupa as GrupaSanguina,
            oras,
            dataUltimeiDonari: dataDonare || null,
        })
        if (salvat) setEditMode(false)
    }

    function marcheazaDonareNoua() {
        const azi = new Date().toISOString().slice(0, 10)
        return salveazaUtilizator({ dataUltimeiDonari: azi })
    }

    // ---------- Formular înregistrare / editare profil donator ----------
    if (!user.esteDonator || editMode) {
        return (
            <div className="donorPage">
                <PageHeader
                    className="donorPageHeader"
                    icon={<IconDrop />}
                    eyebrow={user.esteDonator ? 'Editare profil' : 'Devino donator'}
                    title={user.esteDonator ? 'Editează profilul de donator' : 'Devino donator'}
                    subtitle="Completează datele tale, ca să apari pentru cei care au nevoie de sânge compatibil."
                />

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
                                    disabled={seSalveaza}
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

                            {eroare && <p className="apiErrorMsg">{eroare}</p>}
                        </motion.form>
                    </div>
                </div>
            </div>
        )
    }

    // ---------- Profil donator (deja donator) ----------
    const eligibil = esteEligibilPentruDonare(user.dataUltimeiDonari)
    const progres = progresEligibilitate(user.dataUltimeiDonari)

    const cereriCompatibile = (cereri ?? []).filter(
        (r) =>
            r.status === 'activa' &&
            r.solicitantId !== user.id &&
            user.grupaSanguina &&
            esteCompatibil(user.grupaSanguina, r.grupaNecesara) &&
            r.oras === user.oras
    )

    async function confirmaDisponibilitate(cererId: string) {
        setEroare('')
        try {
            await api.responses.createResponse(cererId)
            updateUser({ dataUltimeiDonari: new Date().toISOString().slice(0, 10) })
            reincarcaRaspunsuri()
        } catch (e) {
            setEroare(e instanceof Error ? e.message : 'Disponibilitatea nu a putut fi confirmată.')
        }
    }

    return (
        <div className="donorPage">
            <PageHeader
                className="donorPageHeader"
                icon={<IconDrop />}
                eyebrow="Ești donator activ"
                title="Profilul tău de donator"
                subtitle="Mulțumim! Profilul tău e vizibil pentru cei care au nevoie de sânge."
            />

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
                        <CircularProgress
                            percent={progres}
                            color={eligibil ? 'var(--color-success)' : 'var(--color-warning)'}
                            label="eligibil"
                        />
                        <span className={`iconText donorEligibilityText ${eligibil ? 'donorEligibilityTextOk' : 'donorEligibilityTextWait'}`}>
                            {eligibil && <IconCheck />}
                            {eligibil
                                ? 'Poți dona sânge acum'
                                : `Poți dona din nou pe ${dataUrmatoareiDonari(user.dataUltimeiDonari!)}`}
                        </span>
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

                {(eroare || eroareCereri) && <p className="apiErrorMsg">{eroare || eroareCereri}</p>}

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
                        {cereriCompatibile.slice(0, 3).map((r) => {
                            const raspunsulMeu = raspunsuri?.find((x) => x.cererId === r.id)
                            return (
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
                                    <p className="donorRequestRequester">Solicitat de {r.solicitantNume}</p>
                                    {raspunsulMeu ? (
                                        <>
                                            <button className="donorRequestConfirmButton donorRequestConfirmButtonDone" disabled>
                                                <span className="iconText"><IconCheck /> Ai confirmat disponibilitatea</span>
                                            </button>
                                            {raspunsulMeu.solicitantTelefon && (
                                                <p className="donorRequestContact iconText">
                                                    <IconPhone /> Contact: {raspunsulMeu.solicitantTelefon}
                                                </p>
                                            )}
                                        </>
                                    ) : !eligibil ? (
                                        <p className="donorRequestNotEligible">
                                            Poți dona din nou pe {dataUrmatoareiDonari(user.dataUltimeiDonari!)}
                                        </p>
                                    ) : (
                                        <button
                                            className="donorRequestConfirmButton"
                                            onClick={() => confirmaDisponibilitate(r.id)}
                                        >
                                            Confirmă disponibilitatea
                                        </button>
                                    )}
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                <Link to="/cereri-compatibile" className="donorCta donorCtaLink">
                    Vezi toate cererile compatibile
                </Link>
            </div>
        </div>
    )
}
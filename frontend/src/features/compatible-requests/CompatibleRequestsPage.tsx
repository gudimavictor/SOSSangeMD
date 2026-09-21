import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { esteCompatibil, esteEligibilPentruDonare, dataUrmatoareiDonari } from '../requests/compatibilitate'
import { useApi } from '../../api/use-api'
import { useAsync } from '../../api/useAsync'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { PageHeader } from '../../components/ui/PageHeader'
import { IconDrop, IconLocation, IconCheck, IconUsers, IconPhone } from '../../components/ui/Icons'
import type { BloodRequest, NivelUrgenta } from '../requests/types'
import './CompatibleRequestsPage.css'

type FiltruUrgenta = 'toate' | NivelUrgenta
type SortBy = 'urgenta' | 'data'

const orase = ['Toate orașele', 'Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

const filtreUrgenta: { value: FiltruUrgenta; label: string }[] = [
    { value: 'toate', label: 'Toate' },
    { value: 'critica', label: 'Critică' },
    { value: 'urgenta', label: 'Urgentă' },
    { value: 'programata', label: 'Programată' },
]

const urgentaOrdine: Record<NivelUrgenta, number> = { critica: 0, urgenta: 1, programata: 2 }

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

function formateazaData(data: string) {
    return new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function CompatibleRequestsPage() {
    const { user, updateUser } = useAuth()
    const api = useApi()
    const [orasFiltru, setOrasFiltru] = useState('Toate orașele')
    const [urgentaFiltru, setUrgentaFiltru] = useState<FiltruUrgenta>('toate')
    const [sortBy, setSortBy] = useState<SortBy>('urgenta')
    const [eroare, setEroare] = useState('')

    const esteDonatorActiv = !!user?.esteDonator && !!user.grupaSanguina
    const {
        data: cereri,
        error: eroareCereri,
        loading,
    } = useAsync(() => api.requests.listRequests(), [user?.id ?? null], esteDonatorActiv)
    const { data: raspunsuri, reload: reincarcaRaspunsuri } = useAsync(
        () => api.responses.listMyResponses(),
        [user?.id ?? null],
        esteDonatorActiv,
    )

    if (!user) {
        return (
            <div className="compatPage">
                <PageHeader
                    className="compatPageHeader"
                    icon={<IconUsers />}
                    eyebrow="Pentru donatori"
                    title="Cereri compatibile"
                    subtitle="Vezi toate cererile active compatibile cu grupa ta sanguină, din toată Republica Moldova."
                />
                <div className="compatBody">
                    <div className="compatLoginPrompt">
                        <p>Trebuie să fii autentificat ca să vezi cererile compatibile.</p>
                        <Link to="/login" search={{ redirect: '/cereri-compatibile' }} className="compatCta">
                            Autentifică-te
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!user.esteDonator || !user.grupaSanguina) {
        return (
            <div className="compatPage">
                <PageHeader
                    className="compatPageHeader"
                    icon={<IconUsers />}
                    eyebrow="Pentru donatori"
                    title="Cereri compatibile"
                    subtitle="Vezi toate cererile active compatibile cu grupa ta sanguină, din toată Republica Moldova."
                />
                <div className="compatBody">
                    <div className="compatLoginPrompt">
                        <p>Trebuie să-ți completezi profilul de donator (grupa sanguină), ca să-ți arătăm cererile compatibile.</p>
                        <Link to="/sunt-donator" className="compatCta">
                            Completează profilul
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const grupaMea = user.grupaSanguina
    const toateCererile: BloodRequest[] = (cereri ?? []).filter(
        (r) => r.status === 'activa' && r.solicitantId !== user.id && esteCompatibil(grupaMea, r.grupaNecesara)
    )

    let cereriFiltrate = toateCererile
    if (orasFiltru !== 'Toate orașele') {
        cereriFiltrate = cereriFiltrate.filter((r) => r.oras === orasFiltru)
    }
    if (urgentaFiltru !== 'toate') {
        cereriFiltrate = cereriFiltrate.filter((r) => r.urgenta === urgentaFiltru)
    }

    cereriFiltrate =
        sortBy === 'urgenta'
            ? [...cereriFiltrate].sort((a, b) => urgentaOrdine[a.urgenta] - urgentaOrdine[b.urgenta])
            : [...cereriFiltrate].sort((a, b) => b.dataCreare.localeCompare(a.dataCreare))

    const cereriCritice = toateCererile.filter((r) => r.urgenta === 'critica').length
    const raspunsurileMele = raspunsuri ?? []
    const eligibil = esteEligibilPentruDonare(user.dataUltimeiDonari)

    async function confirmaDisponibilitate(r: BloodRequest) {
        setEroare('')
        try {
            await api.responses.createResponse(r.id)
            updateUser({ dataUltimeiDonari: new Date().toISOString().slice(0, 10) })
            reincarcaRaspunsuri()
        } catch (e) {
            setEroare(e instanceof Error ? e.message : 'Disponibilitatea nu a putut fi confirmată.')
        }
    }

    return (
        <div className="compatPage">
            <PageHeader
                className="compatPageHeader"
                icon={<IconUsers />}
                eyebrow="Pentru donatori"
                title="Cereri compatibile"
                subtitle={
                    <>
                        Cu grupa ta, <strong>{grupaMea}</strong>, poți răspunde la aceste cereri active din toată țara.
                    </>
                }
            />

            <div className="compatBody">
                <motion.div
                    className="compatStatsRow"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div className="compatStatItem" variants={fadeUpItem}>
                        <span className="compatStatNumber">
                            <AnimatedNumber value={toateCererile.length} />
                        </span>
                        <span className="compatStatLabel">Cereri compatibile</span>
                    </motion.div>
                    <motion.div className="compatStatItem" variants={fadeUpItem}>
                        <span className="compatStatNumber">
                            <AnimatedNumber value={cereriCritice} />
                        </span>
                        <span className="compatStatLabel">Critice</span>
                    </motion.div>
                    <motion.div className="compatStatItem" variants={fadeUpItem}>
                        <span className="compatStatNumber">
                            <AnimatedNumber value={raspunsurileMele.length} />
                        </span>
                        <span className="compatStatLabel">Ai confirmat</span>
                    </motion.div>
                </motion.div>

                <div className="compatControls">
                    <div className="compatUrgencyTabs">
                        {filtreUrgenta.map((f) => (
                            <button
                                key={f.value}
                                className={`compatUrgencyTab ${urgentaFiltru === f.value ? 'compatUrgencyTabActive' : ''}`}
                                onClick={() => setUrgentaFiltru(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="compatFilters">
                        <div className="compatFilterSelect">
                            <CustomSelect options={orase} value={orasFiltru} onChange={setOrasFiltru} />
                        </div>
                        <div className="compatFilterSelect">
                            <CustomSelect
                                options={['urgenta', 'data']}
                                value={sortBy}
                                onChange={(v) => setSortBy(v as SortBy)}
                                labels={{ urgenta: 'Sortează: Urgență', data: 'Sortează: Dată' }}
                            />
                        </div>
                    </div>
                </div>

                {(eroare || eroareCereri) && <p className="apiErrorMsg">{eroare || eroareCereri}</p>}

                {loading ? (
                    <p className="compatEmptyState">Se încarcă cererile...</p>
                ) : cereriFiltrate.length === 0 ? (
                    <div className="compatEmptyState">
                        <span className="compatEmptyIcon"><IconDrop /></span>
                        <p>Nu există cereri compatibile cu filtrele selectate momentan.</p>
                    </div>
                ) : (
                    <motion.div
                        className="compatList"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <AnimatePresence>
                            {cereriFiltrate.map((r) => {
                                const raspunsulMeu = raspunsurileMele.find((x) => x.cererId === r.id)
                                return (
                                    <motion.div
                                        key={r.id}
                                        layout
                                        variants={fadeUpItem}
                                        className={`compatCard compatCard--${r.urgenta}`}
                                    >
                                        <div className="compatCardTop">
                                            <span className="compatCardGroup">{r.grupaNecesara}</span>
                                            <span className={`compatUrgencyBadge compatUrgencyBadge--${r.urgenta}`}>
                                                {r.urgenta}
                                            </span>
                                        </div>

                                        <p className="compatCardDesc">{r.descriere || 'Fără descriere.'}</p>

                                        <div className="compatCardFooter">
                                            <span className="compatCardCity iconText"><IconLocation /> {r.oras}</span>
                                            <span className="compatCardDate">{formateazaData(r.dataCreare)}</span>
                                        </div>

                                        <p className="compatCardRequester">Solicitat de {r.solicitantNume}</p>

                                        {raspunsulMeu ? (
                                            <>
                                                <button className="compatConfirmButton compatConfirmButtonDone" disabled>
                                                    <span className="iconText"><IconCheck /> Ai confirmat disponibilitatea</span>
                                                </button>
                                                {raspunsulMeu.solicitantTelefon && (
                                                    <p className="compatContact iconText">
                                                        <IconPhone /> Contact: {raspunsulMeu.solicitantTelefon}
                                                    </p>
                                                )}
                                            </>
                                        ) : !eligibil ? (
                                            <p className="compatNotEligible">
                                                Poți dona din nou pe {dataUrmatoareiDonari(user.dataUltimeiDonari!)}
                                            </p>
                                        ) : (
                                            <button className="compatConfirmButton" onClick={() => confirmaDisponibilitate(r)}>
                                                Confirmă disponibilitatea
                                            </button>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
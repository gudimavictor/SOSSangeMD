import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { grupeleSanguine, esteEligibilPentruDonare, dataUrmatoareiDonari } from '../requests/compatibilitate'
import { useApi } from '../../api/use-api'
import { useAsync } from '../../api/useAsync'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { IconDrop, IconLocation, IconCheck, IconPhone } from '../../components/ui/Icons'
import { PageHeader } from '../../components/ui/PageHeader'
import type { BloodRequest, NivelUrgenta } from '../requests/types'
import './HomePage.css'

type FiltruUrgenta = 'toate' | NivelUrgenta
type SortBy = 'urgenta' | 'data'

const orase = ['Toate orașele', 'Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']
const grupe = ['Toate grupele', ...grupeleSanguine]

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

export function HomePage() {
    const { user, updateUser } = useAuth()
    const api = useApi()
    const eligibil = user ? esteEligibilPentruDonare(user.dataUltimeiDonari) : true

    const [cautare, setCautare] = useState('')
    const [orasFiltru, setOrasFiltru] = useState('Toate orașele')
    const [grupaFiltru, setGrupaFiltru] = useState('Toate grupele')
    const [urgentaFiltru, setUrgentaFiltru] = useState<FiltruUrgenta>('toate')
    const [sortBy, setSortBy] = useState<SortBy>('urgenta')
    const [eroare, setEroare] = useState('')

    const { data: cereri, error: eroareCereri, loading } = useAsync(() => api.requests.listRequests(), [])
    const { data: raspunsuri, reload: reincarcaRaspunsuri } = useAsync(
        () => api.responses.listMyResponses(),
        [user?.id ?? null],
        !!user,
    )

    const toateCererile: BloodRequest[] = (cereri ?? []).filter((r) => r.status === 'activa')

    const cereriCritice = toateCererile.filter((r) => r.urgenta === 'critica').length
    const oraseAcoperite = new Set(toateCererile.map((r) => r.oras)).size

    let cereriFiltrate = toateCererile
    if (orasFiltru !== 'Toate orașele') {
        cereriFiltrate = cereriFiltrate.filter((r) => r.oras === orasFiltru)
    }
    if (grupaFiltru !== 'Toate grupele') {
        cereriFiltrate = cereriFiltrate.filter((r) => r.grupaNecesara === grupaFiltru)
    }
    if (urgentaFiltru !== 'toate') {
        cereriFiltrate = cereriFiltrate.filter((r) => r.urgenta === urgentaFiltru)
    }
    if (cautare.trim()) {
        const q = cautare.toLowerCase()
        cereriFiltrate = cereriFiltrate.filter(
            (r) =>
                r.solicitantNume.toLowerCase().includes(q) ||
                r.descriere.toLowerCase().includes(q) ||
                r.oras.toLowerCase().includes(q)
        )
    }

    cereriFiltrate =
        sortBy === 'urgenta'
            ? [...cereriFiltrate].sort((a, b) => urgentaOrdine[a.urgenta] - urgentaOrdine[b.urgenta])
            : [...cereriFiltrate].sort((a, b) => b.dataCreare.localeCompare(a.dataCreare))

    async function confirmaDisponibilitate(r: BloodRequest) {
        if (!user) return

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
        <div className="homeFeedPage">
            <div className="feedHeader">
                <PageHeader
                    icon={<IconDrop />}
                    eyebrow="Cereri active acum"
                    title="Cine are nevoie de sânge chiar acum"
                    subtitle="Vezi toate cererile active din toată Republica Moldova și ajută pe oricine, indiferent de grupa ta sanguină."
                />
                <div className="feedHeaderActions">
                    <Link to="/creeaza-cerere" className="feedCta">
                        Am nevoie de sânge
                    </Link>
                    <Link to="/cereri-compatibile" className="feedCtaSecondary">
                        Vezi cererile compatibile cu mine
                    </Link>
                </div>
            </div>

            <div className="feedBody">
                <motion.div className="feedStatsRow" variants={staggerContainer} initial="hidden" animate="show">
                    <motion.div className="feedStatItem" variants={fadeUpItem}>
                        <span className="feedStatNumber"><AnimatedNumber value={toateCererile.length} /></span>
                        <span className="feedStatLabel">Cereri active</span>
                    </motion.div>
                    <motion.div className="feedStatItem" variants={fadeUpItem}>
                        <span className="feedStatNumber"><AnimatedNumber value={cereriCritice} /></span>
                        <span className="feedStatLabel">Critice</span>
                    </motion.div>
                    <motion.div className="feedStatItem" variants={fadeUpItem}>
                        <span className="feedStatNumber"><AnimatedNumber value={oraseAcoperite} /></span>
                        <span className="feedStatLabel">Orașe acoperite</span>
                    </motion.div>
                </motion.div>

                <div className="feedControls">
                    <input
                        className="feedSearchInput"
                        placeholder="Caută după nume, oraș sau descriere..."
                        value={cautare}
                        onChange={(e) => setCautare(e.target.value)}
                    />

                    <div className="feedUrgencyTabs">
                        {filtreUrgenta.map((f) => (
                            <button
                                key={f.value}
                                className={`feedUrgencyTab ${urgentaFiltru === f.value ? 'feedUrgencyTabActive' : ''}`}
                                onClick={() => setUrgentaFiltru(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="feedFilters">
                        <div className="feedFilterSelect">
                            <CustomSelect options={orase} value={orasFiltru} onChange={setOrasFiltru} />
                        </div>
                        <div className="feedFilterSelect">
                            <CustomSelect options={grupe} value={grupaFiltru} onChange={setGrupaFiltru} />
                        </div>
                        <div className="feedFilterSelect">
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
                    <p className="feedEmptyState">Se încarcă cererile...</p>
                ) : cereriFiltrate.length === 0 ? (
                    <div className="feedEmptyState">
                        <span className="feedEmptyIcon"><IconDrop /></span>
                        <p>Nu există cereri active care să corespundă filtrelor selectate.</p>
                    </div>
                ) : (
                    <motion.div className="feedList" variants={staggerContainer} initial="hidden" animate="show">
                        <AnimatePresence>
                            {cereriFiltrate.map((r) => {
                                const esteCererea = user?.id === r.solicitantId
                                const raspunsulMeu = raspunsuri?.find((x) => x.cererId === r.id)

                                return (
                                    <motion.div
                                        key={r.id}
                                        layout
                                        variants={fadeUpItem}
                                        className={`feedCard feedCard--${r.urgenta}`}
                                    >
                                        <div className="feedCardTop">
                                            <span className="feedCardGroup">{r.grupaNecesara}</span>
                                            <span className={`feedUrgencyBadge feedUrgencyBadge--${r.urgenta}`}>
                                                {r.urgenta}
                                            </span>
                                        </div>

                                        <p className="feedCardDesc">{r.descriere || 'Fără descriere.'}</p>

                                        <div className="feedCardFooter">
                                            <span className="feedCardCity iconText"><IconLocation /> {r.oras}</span>
                                            <span className="feedCardDate">{formateazaData(r.dataCreare)}</span>
                                        </div>

                                        <p className="feedCardRequester">Solicitat de {r.solicitantNume}</p>

                                        {esteCererea ? (
                                            <span className="feedOwnBadge">Cererea ta</span>
                                        ) : !user ? (
                                            <Link
                                                to="/login"
                                                search={{ redirect: '/' }}
                                                className="feedConfirmButton feedConfirmButtonLink"
                                            >
                                                Autentifică-te ca să ajuți
                                            </Link>
                                        ) : raspunsulMeu ? (
                                            <>
                                                <button className="feedConfirmButton feedConfirmButtonDone" disabled>
                                                    <span className="iconText"><IconCheck /> Ai confirmat disponibilitatea</span>
                                                </button>
                                                {raspunsulMeu.solicitantTelefon && (
                                                    <p className="feedContact iconText">
                                                        <IconPhone /> Contact: {raspunsulMeu.solicitantTelefon}
                                                    </p>
                                                )}
                                            </>
                                        ) : !eligibil ? (
                                            <p className="feedNotEligible">
                                                Poți dona din nou pe {dataUrmatoareiDonari(user.dataUltimeiDonari!)}
                                            </p>
                                        ) : (
                                            <button className="feedConfirmButton" onClick={() => confirmaDisponibilitate(r)}>
                                                Vreau să ajut
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

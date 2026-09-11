import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { mockRequests } from '../requests/mockRequests'
import { getRequests } from '../requests/requestsStore'
import { esteCompatibil } from '../requests/compatibilitate'
import { addResponse, aRaspunsDeja, getResponsesByDonor } from '../requests/requestResponsesStore'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
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
    const { user } = useAuth()
    const [orasFiltru, setOrasFiltru] = useState('Toate orașele')
    const [urgentaFiltru, setUrgentaFiltru] = useState<FiltruUrgenta>('toate')
    const [sortBy, setSortBy] = useState<SortBy>('urgenta')
    const [, setVersiune] = useState(0)

    const refresh = () => setVersiune((v) => v + 1)

    if (!user) {
        return (
            <div className="compatPage">
                <div className="compatPageHeader">
                    <span className="compatEyebrow">Pentru donatori</span>
                    <h1 className="compatPageTitle">Cereri compatibile</h1>
                    <p className="compatPageSubtitle">
                        Vezi toate cererile active compatibile cu grupa ta sanguină, din toată Republica Moldova.
                    </p>
                </div>
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
                <div className="compatPageHeader">
                    <span className="compatEyebrow">Pentru donatori</span>
                    <h1 className="compatPageTitle">Cereri compatibile</h1>
                    <p className="compatPageSubtitle">
                        Vezi toate cererile active compatibile cu grupa ta sanguină, din toată Republica Moldova.
                    </p>
                </div>
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

    const toateCererile: BloodRequest[] = [...getRequests(), ...mockRequests].filter(
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
    const raspunsurileMele = getResponsesByDonor(user.id)

    function confirmaDisponibilitate(r: BloodRequest) {
        addResponse({
            id: crypto.randomUUID(),
            cererId: r.id,
            donatorId: user!.id,
            donatorNume: user!.nume,
            status: 'disponibil',
            data: new Date().toISOString().slice(0, 10),
        })
        refresh()
    }

    return (
        <div className="compatPage">
            <motion.div
                className="compatPageHeader"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                <motion.span className="compatEyebrow" variants={fadeUpItem}>
                    Pentru donatori
                </motion.span>
                <motion.h1 className="compatPageTitle" variants={fadeUpItem}>
                    Cereri compatibile
                </motion.h1>
                <motion.p className="compatPageSubtitle" variants={fadeUpItem}>
                    Cu grupa ta, <strong>{grupaMea}</strong>, poți răspunde la aceste cereri active din toată țara.
                </motion.p>
            </motion.div>

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

                {cereriFiltrate.length === 0 ? (
                    <div className="compatEmptyState">
                        <span className="compatEmptyIcon">🩸</span>
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
                                const araspuns = aRaspunsDeja(r.id, user.id)
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
                                            <span className="compatCardCity">📍 {r.oras}</span>
                                            <span className="compatCardDate">{formateazaData(r.dataCreare)}</span>
                                        </div>

                                        <p className="compatCardRequester">Solicitat de {r.solicitantNume}</p>

                                        <button
                                            className={`compatConfirmButton ${araspuns ? 'compatConfirmButtonDone' : ''}`}
                                            onClick={() => confirmaDisponibilitate(r)}
                                            disabled={araspuns}
                                        >
                                            {araspuns ? '✓ Ai confirmat disponibilitatea' : 'Confirmă disponibilitatea'}
                                        </button>
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
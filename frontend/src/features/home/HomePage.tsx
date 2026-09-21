import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { grupeleSanguine, esteEligibilPentruDonare, dataUrmatoareiDonari } from '../requests/compatibilitate'
import { useApi } from '../../api/use-api'
import { useAsync } from '../../api/useAsync'
import { useCityLabels } from '../../i18n/useCityLabels'
import { useDateLocale } from '../../i18n/useDateLocale'
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

const filtreUrgenta: FiltruUrgenta[] = ['toate', 'critica', 'urgenta', 'programata']

const urgentaOrdine: Record<NivelUrgenta, number> = { critica: 0, urgenta: 1, programata: 2 }

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

export function HomePage() {
    const { user, updateUser } = useAuth()
    const api = useApi()
    const { t } = useTranslation('home')
    const { t: tc } = useTranslation('common')
    const cityLabels = useCityLabels()
    const dateLocale = useDateLocale()
    const eligibil = user ? esteEligibilPentruDonare(user.dataUltimeiDonari) : true

    const [cautare, setCautare] = useState('')
    const [orasFiltru, setOrasFiltru] = useState('Toate orașele')
    const [grupaFiltru, setGrupaFiltru] = useState('Toate grupele')
    const [urgentaFiltru, setUrgentaFiltru] = useState<FiltruUrgenta>('toate')
    const [sortBy, setSortBy] = useState<SortBy>('urgenta')
    const [eroare, setEroare] = useState('')

    const formateazaData = (data: string) =>
        new Date(data).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
    const etichetaOrase = { 'Toate orașele': t('filters.allCities'), ...cityLabels }
    const etichetaGrupe = { 'Toate grupele': t('filters.allGroups') }

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
            setEroare(e instanceof Error ? e.message : t('errors.confirmFailed'))
        }
    }

    return (
        <div className="homeFeedPage">
            <div className="feedHeader">
                <PageHeader
                    icon={<IconDrop />}
                    eyebrow={t('header.eyebrow')}
                    title={t('header.title')}
                    subtitle={t('header.subtitle')}
                />
                <div className="feedHeaderActions">
                    <Link to="/creeaza-cerere" className="feedCta">
                        {t('header.needBlood')}
                    </Link>
                    <Link to="/cereri-compatibile" className="feedCtaSecondary">
                        {t('header.seeCompatible')}
                    </Link>
                </div>
            </div>

            <div className="feedBody">
                <motion.div className="feedStatsRow" variants={staggerContainer} initial="hidden" animate="show">
                    <motion.div className="feedStatItem" variants={fadeUpItem}>
                        <span className="feedStatNumber"><AnimatedNumber value={toateCererile.length} /></span>
                        <span className="feedStatLabel">{t('stats.active')}</span>
                    </motion.div>
                    <motion.div className="feedStatItem" variants={fadeUpItem}>
                        <span className="feedStatNumber"><AnimatedNumber value={cereriCritice} /></span>
                        <span className="feedStatLabel">{t('stats.critical')}</span>
                    </motion.div>
                    <motion.div className="feedStatItem" variants={fadeUpItem}>
                        <span className="feedStatNumber"><AnimatedNumber value={oraseAcoperite} /></span>
                        <span className="feedStatLabel">{t('stats.cities')}</span>
                    </motion.div>
                </motion.div>

                <div className="feedControls">
                    <input
                        className="feedSearchInput"
                        placeholder={t('filters.search')}
                        value={cautare}
                        onChange={(e) => setCautare(e.target.value)}
                    />

                    <div className="feedUrgencyTabs">
                        {filtreUrgenta.map((f) => (
                            <button
                                key={f}
                                className={`feedUrgencyTab ${urgentaFiltru === f ? 'feedUrgencyTabActive' : ''}`}
                                onClick={() => setUrgentaFiltru(f)}
                            >
                                {f === 'toate' ? tc('all') : tc(`urgency.${f}`)}
                            </button>
                        ))}
                    </div>

                    <div className="feedFilters">
                        <div className="feedFilterSelect">
                            <CustomSelect options={orase} value={orasFiltru} onChange={setOrasFiltru} labels={etichetaOrase} />
                        </div>
                        <div className="feedFilterSelect">
                            <CustomSelect options={grupe} value={grupaFiltru} onChange={setGrupaFiltru} labels={etichetaGrupe} />
                        </div>
                        <div className="feedFilterSelect">
                            <CustomSelect
                                options={['urgenta', 'data']}
                                value={sortBy}
                                onChange={(v) => setSortBy(v as SortBy)}
                                labels={{ urgenta: t('filters.sortUrgency'), data: t('filters.sortDate') }}
                            />
                        </div>
                    </div>
                </div>

                {(eroare || eroareCereri) && <p className="apiErrorMsg">{eroare || eroareCereri}</p>}

                {loading ? (
                    <p className="feedEmptyState">{t('loading')}</p>
                ) : cereriFiltrate.length === 0 ? (
                    <div className="feedEmptyState">
                        <span className="feedEmptyIcon"><IconDrop /></span>
                        <p>{t('empty')}</p>
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
                                                {tc(`urgency.${r.urgenta}`)}
                                            </span>
                                        </div>

                                        <p className="feedCardDesc">{r.descriere || t('card.noDescription')}</p>

                                        <div className="feedCardFooter">
                                            <span className="feedCardCity iconText"><IconLocation /> {r.oras}</span>
                                            <span className="feedCardDate">{formateazaData(r.dataCreare)}</span>
                                        </div>

                                        <p className="feedCardRequester">{t('card.requestedBy', { name: r.solicitantNume })}</p>

                                        {esteCererea ? (
                                            <span className="feedOwnBadge">{t('card.ownRequest')}</span>
                                        ) : !user ? (
                                            <Link
                                                to="/login"
                                                search={{ redirect: '/' }}
                                                className="feedConfirmButton feedConfirmButtonLink"
                                            >
                                                {t('card.loginToHelp')}
                                            </Link>
                                        ) : raspunsulMeu ? (
                                            <>
                                                <button className="feedConfirmButton feedConfirmButtonDone" disabled>
                                                    <span className="iconText"><IconCheck /> {t('card.confirmed')}</span>
                                                </button>
                                                {raspunsulMeu.solicitantTelefon && (
                                                    <p className="feedContact iconText">
                                                        <IconPhone /> {t('card.contact', { phone: raspunsulMeu.solicitantTelefon })}
                                                    </p>
                                                )}
                                            </>
                                        ) : !eligibil ? (
                                            <p className="feedNotEligible">
                                                {t('card.canDonateAgain', {
                                                    date: dataUrmatoareiDonari(user.dataUltimeiDonari!, dateLocale),
                                                })}
                                            </p>
                                        ) : (
                                            <button className="feedConfirmButton" onClick={() => confirmaDisponibilitate(r)}>
                                                {t('card.help')}
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

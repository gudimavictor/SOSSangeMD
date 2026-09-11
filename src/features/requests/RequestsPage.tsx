import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import type { GrupaSanguina } from '../auth/AuthContext'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { grupeleSanguine } from './compatibilitate'
import { addRequest } from './requestsStore'
import { IconPencil, IconLocation, IconBulb, IconCheck } from '../../components/ui/Icons'
import type { NivelUrgenta } from './types'
import './RequestsPage.css'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

const descriereRapida = [
    'Intervenție chirurgicală urgentă',
    'Accident, transfuzie necesară',
    'Naștere, complicații',
    'Boală cronică, transfuzii regulate',
]

const urgencyInfo: { value: NivelUrgenta; title: string; desc: string }[] = [
    { value: 'critica', title: 'Critică', desc: 'Ai nevoie acum' },
    { value: 'urgenta', title: 'Urgentă', desc: 'În câteva zile' },
    { value: 'programata', title: 'Programată', desc: 'Mai mult timp' },
]

const urgencyLabel: Record<NivelUrgenta, string> = {
    critica: 'critică',
    urgenta: 'urgentă',
    programata: 'programată',
}

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

export function CreateRequestPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [grupa, setGrupa] = useState('')
    const [oras, setOras] = useState('')
    const [urgenta, setUrgenta] = useState<NivelUrgenta>('urgenta')
    const [descriere, setDescriere] = useState('')
    const [trimis, setTrimis] = useState(false)

    function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (!grupa || !oras || !user) return

        addRequest({
            id: crypto.randomUUID(),
            solicitantId: user.id,
            solicitantNume: user.nume,
            grupaNecesara: grupa as GrupaSanguina,
            oras,
            urgenta,
            descriere,
            status: 'activa',
            dataCreare: new Date().toISOString().slice(0, 10),
        })

        setTrimis(true)

        setTimeout(() => {
            navigate({ to: '/cererile-mele' })
        }, 1200)
    }

    if (!user) {
        return (
            <div className="requestsPage">
                <div className="reqPageHeader">
                    <span className="reqEyebrow">Cerere nouă</span>
                    <h1 className="reqPageTitle">Creează o cerere de sânge</h1>
                    <p className="reqPageSubtitle">
                        Completează detaliile — sistemul va căuta automat donatori compatibili
                    </p>
                </div>

                <div className="reqBody">
                    <div className="reqLoginPrompt">
                        <p>Trebuie să fii autentificat ca să creezi o cerere de sânge.</p>
                        <Link to="/login" search={{ redirect: '/creeaza-cerere' }} className="reqCta">
                            Autentifică-te
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const areCompletare = Boolean(grupa || oras || descriere)

    return (
        <div className="requestsPage">
            <motion.div
                className="reqPageHeader"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
            >
                <motion.span className="reqEyebrow" variants={fadeUpItem}>
                    Cerere nouă
                </motion.span>
                <motion.h1 className="reqPageTitle" variants={fadeUpItem}>
                    Creează o cerere de sânge
                </motion.h1>
                <motion.p className="reqPageSubtitle" variants={fadeUpItem}>
                    Completează detaliile — sistemul va căuta automat donatori compatibili
                </motion.p>
            </motion.div>

            <div className="reqBodyGrid">
                <div className="formColumn">
                    <motion.form
                        className="form"
                        onSubmit={handleSubmit}
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <motion.div className="formRow" variants={fadeUpItem}>
                            <div className="formField">
                                <label>Grupa sanguină necesară</label>
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
                            className="formRow"
                            style={{ gridTemplateColumns: '1fr' }}
                            variants={fadeUpItem}
                        >
                            <div className="formField">
                                <label>Nivel de urgență</label>
                                <div className="urgencyPicker">
                                    {urgencyInfo.map((item) => (
                                        <motion.button
                                            key={item.value}
                                            type="button"
                                            whileTap={{ scale: 0.97 }}
                                            className={`urgencyOption urgencyOption--${item.value} ${urgenta === item.value ? 'urgencyOptionActive' : ''}`}
                                            onClick={() => setUrgenta(item.value)}
                                        >
                                            <div className="urgencyOptionTitle">{item.title}</div>
                                            <div className="urgencyOptionDesc">{item.desc}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="formRow"
                            style={{ gridTemplateColumns: '1fr' }}
                            variants={fadeUpItem}
                        >
                            <div className="formField">
                                <label htmlFor="descriere">Descriere</label>
                                <div className="quickFills">
                                    {descriereRapida.map((text) => (
                                        <button
                                            key={text}
                                            type="button"
                                            className="quickFillChip"
                                            onClick={() => setDescriere(text)}
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    id="descriere"
                                    rows={3}
                                    value={descriere}
                                    onChange={(e) => setDescriere(e.target.value)}
                                    placeholder="Ex: Am nevoie de sânge pentru o intervenție chirurgicală urgentă..."
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUpItem}>
                            <motion.button
                                type="submit"
                                className="submitButton"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={trimis}
                            >
                                {trimis ? 'Se trimite...' : 'Trimite cererea'}
                            </motion.button>
                        </motion.div>

                        <AnimatePresence>
                            {trimis && (
                                <motion.div
                                    className="successBox"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <span className="iconText"><IconCheck /> Cererea a fost trimisă! Te redirecționăm spre „Cererile mele"...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.form>
                </div>

                <motion.div
                    className="previewColumn"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div className="previewCard" variants={fadeUpItem}>
                        <p className="previewCardLabel">Previzualizare</p>
                        {!areCompletare ? (
                            <div className="previewEmpty">
                                <span className="previewEmptyIcon"><IconPencil /></span>
                                <p>Completează formularul ca să vezi cum arată cererea ta.</p>
                            </div>
                        ) : (
                            <>
                                <div className="previewTop">
                                    <span className="previewGroup">{grupa || '—'}</span>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={urgenta}
                                            className={`previewBadge previewBadge--${urgenta}`}
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.85 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {urgencyLabel[urgenta]}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                                <p className="previewCity iconText"><IconLocation /> {oras || 'Oraș neselectat'}</p>
                                <p className="previewDesc">{descriere || 'Fără descriere adăugată.'}</p>
                                <div className="previewFooter">
                                    <span>{user.nume}</span>
                                    <span>azi</span>
                                </div>
                            </>
                        )}
                    </motion.div>

                    <motion.div className="nextStepsCard" variants={fadeUpItem}>
                        <p className="nextStepsTitle">Ce urmează după trimitere</p>
                        <ul className="nextStepsList">
                            <li>
                                <span className="nextStepsNum">1</span>
                                Cererea ta devine vizibilă imediat pentru donatorii compatibili
                            </li>
                            <li>
                                <span className="nextStepsNum">2</span>
                                Sistemul identifică donatorii eligibili din orașul tău
                            </li>
                            <li>
                                <span className="nextStepsNum">3</span>
                                Primul donator disponibil te contactează direct
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div className="tipCard" variants={fadeUpItem}>
                        <span className="tipIcon"><IconBulb /></span>
                        <p className="tipText">
                            Cererile cu o descriere clară primesc răspuns mai rapid de la donatori.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
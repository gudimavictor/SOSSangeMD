import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { GrupaSanguina } from '../auth/AuthContext'
import { esteCompatibil, grupeleSanguine } from '../requests/compatibilitate'
import { IconHeart, IconDrop, IconCheck, IconStar, IconPencil, IconUsers } from '../../components/ui/Icons'
import { PageHeader } from '../../components/ui/PageHeader'
import './AboutPage.css'

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const

const infoGrupa: Record<GrupaSanguina, string> = {
    'O-': 'Donator universal — poate dona către toate grupele',
    'O+': 'Compatibil cu grupele Rh pozitive',
    'A-': 'Compatibil cu A și AB',
    'A+': 'Compatibil cu A+ și AB+',
    'B-': 'Compatibil cu B și AB',
    'B+': 'Compatibil cu B+ și AB+',
    'AB-': 'Compatibil doar cu AB',
    'AB+': 'Primitor universal — poate primi de la toate grupele',
}

const recenzii = [
    {
        nume: 'Ana M.',
        rol: 'A cerut sânge pentru un membru al familiei',
        oras: 'Chișinău',
        text: 'Am găsit un donator compatibil în mai puțin de o oră. Fără platforma asta, nu știu ce ne-am fi făcut.',
    },
    {
        nume: 'Vlad T.',
        rol: 'Donator activ',
        oras: 'Bălți',
        text: 'Donez regulat prin SOS Sânge de câteva luni. E simplu să văd unde e nevoie urgentă și să mă programez.',
    },
    {
        nume: 'Cristina P.',
        rol: 'Donator',
        oras: 'Cahul',
        text: 'Interfața e clară, iar notificările despre cereri compatibile chiar funcționează. Recomand cu încredere.',
    },
]

export function AboutPage() {
    const [grupaSelectata, setGrupaSelectata] = useState<GrupaSanguina | null>(null)
    const [directie, setDirectie] = useState<'donez' | 'primesc'>('donez')

    const rezultat = grupaSelectata
        ? directie === 'donez'
            ? grupeleSanguine.filter((g) => esteCompatibil(grupaSelectata, g))
            : grupeleSanguine.filter((g) => esteCompatibil(g, grupaSelectata))
        : null

    const esteUniversal = grupaSelectata === 'O-'
    const estePrimitorUniversal = grupaSelectata === 'AB+'

    return (
        <div className="aboutPage">
            <PageHeader
                className="aboutPageHeader"
                icon={<IconHeart />}
                eyebrow="Despre noi"
                title="Despre SOS Sânge"
                subtitle="Conectăm rapid pacienții cu donatori compatibili, exact atunci când timpul contează cel mai mult."
            />

            <div className="aboutBody">
                <div className="aboutMotivational">
                    <span className="aboutMotivationalIcon"><IconHeart /></span>
                    <p className="aboutMotivationalText">
                        O singură donare de sânge poate salva până la 3 vieți.
                    </p>
                </div>

                <h2 className="aboutSectionTitle">Cum funcționează</h2>
                <motion.div
                    className="aboutStepsGrid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div className="aboutStepCard" variants={fadeUpItem}>
                        <span className="aboutStepIcon"><IconPencil /><span className="aboutStepNumber">1</span></span>
                        <p className="aboutStepTitle">Creezi o cerere</p>
                        <p className="aboutStepDesc">
                            Completezi grupa sanguină necesară, orașul și nivelul de urgență, pentru tine sau un apropiat.
                        </p>
                    </motion.div>
                    <motion.div className="aboutStepCard" variants={fadeUpItem}>
                        <span className="aboutStepIcon"><IconUsers /><span className="aboutStepNumber">2</span></span>
                        <p className="aboutStepTitle">Sistemul caută donatori</p>
                        <p className="aboutStepDesc">
                            Platforma identifică automat donatorii compatibili, din același oraș, eligibili să doneze.
                        </p>
                    </motion.div>
                    <motion.div className="aboutStepCard" variants={fadeUpItem}>
                        <span className="aboutStepIcon"><IconCheck /><span className="aboutStepNumber">3</span></span>
                        <p className="aboutStepTitle">Donatorul confirmă</p>
                        <p className="aboutStepDesc">
                            Donatorul vede cererea și confirmă disponibilitatea. Vă puteți conecta rapid.
                        </p>
                    </motion.div>
                </motion.div>

                <h2 className="aboutSectionTitle">Verifică-ți compatibilitatea</h2>
                <div className="aboutCompatSection">
                    <div className="aboutCompatMainCard">
                        <div className="aboutCompatToggle">
                            <button
                                type="button"
                                className={`aboutCompatToggleBtn ${directie === 'donez' ? 'aboutCompatToggleBtnActive' : ''}`}
                                onClick={() => setDirectie('donez')}
                            >
                                Pot dona către
                            </button>
                            <button
                                type="button"
                                className={`aboutCompatToggleBtn ${directie === 'primesc' ? 'aboutCompatToggleBtnActive' : ''}`}
                                onClick={() => setDirectie('primesc')}
                            >
                                Pot primi de la
                            </button>
                        </div>

                        <p className="aboutCompatPrompt">Apasă pe grupa ta sanguină:</p>
                        <div className="aboutGroupPicker">
                            {grupeleSanguine.map((grupa) => (
                                <button
                                    key={grupa}
                                    className={`aboutGroupButton ${grupaSelectata === grupa ? 'aboutGroupButtonActive' : ''}`}
                                    onClick={() => setGrupaSelectata(grupa)}
                                    title={infoGrupa[grupa]}
                                >
                                    {grupa}
                                </button>
                            ))}
                        </div>

                        <div className="aboutResultCard">
                            <AnimatePresence mode="wait">
                                {!rezultat ? (
                                    <motion.div
                                        key="empty"
                                        className="aboutResultEmptyState"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="aboutResultEmptyIcon"><IconDrop /></span>
                                        <p className="aboutResultEmpty">Selectează o grupă sanguină mai sus.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={grupaSelectata + directie}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <p className="aboutResultTitle">
                                            {directie === 'donez' ? (
                                                <>
                                                    Cu grupa <strong>{grupaSelectata}</strong>, poți dona către:
                                                </>
                                            ) : (
                                                <>
                                                    Cu grupa <strong>{grupaSelectata}</strong>, poți primi de la:
                                                </>
                                            )}
                                        </p>
                                        <motion.div
                                            className="aboutResultGroups"
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="show"
                                        >
                                            {rezultat.map((g) => (
                                                <motion.span key={g} className="aboutResultGroupTag" variants={fadeUpItem}>
                                                    {g}
                                                </motion.span>
                                            ))}
                                        </motion.div>
                                        {(esteUniversal || estePrimitorUniversal) && (
                                            <div className="aboutResultBadgeRow">
                                                <span className="aboutUniversalTag">
                                                    {esteUniversal ? 'Donator universal' : 'Primitor universal'}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="aboutEligibilityCard">
                        <p className="aboutEligibilityTitle">Cine poate dona sânge?</p>
                        <ul className="aboutEligibilityList">
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Vârsta între 18 și 60 de ani
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Greutate minimă de 50 kg
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Stare generală bună de sănătate
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Au trecut minim 2 luni de la ultima donare
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Nu ai avut o boală infecțioasă recentă
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Nu ai consumat alcool în ultimele 24 de ore
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Ai dormit suficient în noaptea precedentă
                            </li>
                            <li className="aboutEligibilityItem">
                                <span className="aboutEligibilityCheck"><IconCheck /></span>
                                Nu ai făcut un tatuaj sau piercing în ultimele 4 luni
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h2 className="aboutSectionTitle">Ce spun utilizatorii</h2>
                    <motion.div
                        className="aboutReviewsGrid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {recenzii.map((r) => (
                            <motion.div key={r.nume} className="aboutReviewCard" variants={fadeUpItem}>
                                <div className="aboutReviewStars"><IconStar /><IconStar /><IconStar /><IconStar /><IconStar /></div>
                                <p className="aboutReviewText">„{r.text}"</p>
                                <div className="aboutReviewAuthor">
                                    <div className="aboutReviewAvatar">
                                        {r.nume
                                            .split(' ')
                                            .map((w) => w[0])
                                            .join('')}
                                    </div>
                                    <div>
                                        <p className="aboutReviewName">{r.nume}</p>
                                        <p className="aboutReviewRole">
                                            {r.rol} · {r.oras}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { mockRequests } from '../requests/mockRequests'
import { esteCompatibil, grupeleSanguine } from '../requests/compatibilitate'
import type { GrupaSanguina } from '../auth/AuthContext'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { IconHeart, IconDrop, IconCheck, IconStar } from '../../components/ui/Icons'
import './HomePage.css'

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

export function HomePage() {
    const cereriActive = mockRequests.filter((r) => r.status === 'activa')
    const cereriCritice = cereriActive.filter((r) => r.urgenta === 'critica')

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
        <div className="page">
            <motion.div className="hero" variants={staggerContainer} initial="hidden" animate="show">
                <div className="heroContent">
                    <motion.span className="heroBadge" variants={fadeUpItem}>
                        <span className="heroBadgeDot" />
                        Platformă verificată de donare
                    </motion.span>

                    <motion.h1 className="heroTitle" variants={fadeUpItem}>
                        <span className="heroTitleLine">O picătură de sânge</span>
                        <span className="heroTitleLine heroTitleAccent">poate salva o viață</span>
                    </motion.h1>

                    <motion.p className="heroSubtitle" variants={fadeUpItem}>
                        Conectăm rapid pacienții cu donatori compatibili, exact atunci când timpul contează cel mai mult.
                    </motion.p>

                    <motion.div className="heroActions" variants={fadeUpItem}>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                            <Link to="/creeaza-cerere" className="heroButton heroButtonPrimary">
                                Am nevoie de sânge
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                            <Link to="/sunt-donator" className="heroButton heroButtonSecondary">
                                Vreau să donez
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div className="heroStatsInline" variants={fadeUpItem}>
                        <div className="heroStatItem">
                            <span className="heroStatNumber">
                                <AnimatedNumber value={cereriActive.length} />
                            </span>
                            <span className="heroStatLabel">Cereri active</span>
                        </div>
                        <div className="heroStatDivider" />
                        <div className="heroStatItem">
                            <span className="heroStatNumber">
                                <AnimatedNumber value={cereriCritice.length} />
                            </span>
                            <span className="heroStatLabel">Cereri critice</span>
                        </div>
                        <div className="heroStatDivider" />
                        <div className="heroStatItem">
                            <span className="heroStatNumber">
                                <AnimatedNumber value={5} />
                            </span>
                            <span className="heroStatLabel">Centre transfuzie</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="heroFloatCard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                >
                    <p className="heroFloatCardTitle">Cereri active acum</p>

                    {cereriActive.length === 0 && (
                        <p className="heroFloatCardEmpty">Nicio cerere activă momentan.</p>
                    )}

                    {cereriActive.slice(0, 3).map((r) => (
                        <div key={r.id} className="heroFloatCardRow">
                            <div className="heroFloatCardRowInfo">
                                <p className="heroFloatCardRowTitle">
                                    {r.grupaNecesara} · {r.oras}
                                </p>
                                <p className="heroFloatCardRowSub">{r.descriere || 'Cerere activă'}</p>
                            </div>
                            <span className={`heroFloatBadge heroFloatBadge--${r.urgenta}`}>{r.urgenta}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            <div className="body">

                <div className="motivational">
                    <span className="motivationalIcon"><IconHeart /></span>
                    <p className="motivationalText">
                        O singură donare de sânge poate salva până la 3 vieți.
                    </p>
                </div>

                <h2 className="sectionTitle">Cum funcționează</h2>
                <motion.div
                    className="stepsGrid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.div className="stepCard" variants={fadeUpItem}>
                        <span className="stepNumber">1</span>
                        <p className="stepTitle">Creezi o cerere</p>
                        <p className="stepDesc">
                            Completezi grupa sanguină necesară, orașul și nivelul de urgență, pentru tine sau un apropiat.
                        </p>
                    </motion.div>
                    <motion.div className="stepCard" variants={fadeUpItem}>
                        <span className="stepNumber">2</span>
                        <p className="stepTitle">Sistemul caută donatori</p>
                        <p className="stepDesc">
                            Platforma identifică automat donatorii compatibili, din același oraș, eligibili să doneze.
                        </p>
                    </motion.div>
                    <motion.div className="stepCard" variants={fadeUpItem}>
                        <span className="stepNumber">3</span>
                        <p className="stepTitle">Donatorul confirmă</p>
                        <p className="stepDesc">
                            Donatorul vede cererea și confirmă disponibilitatea. Vă puteți conecta rapid.
                        </p>
                    </motion.div>
                </motion.div>

                <h2 className="sectionTitle">Verifică-ți compatibilitatea</h2>
                <div className="compatSection">
                    <div className="compatMainCard">
                        <div className="compatToggle">
                            <button
                                type="button"
                                className={`compatToggleBtn ${directie === 'donez' ? 'compatToggleBtnActive' : ''}`}
                                onClick={() => setDirectie('donez')}
                            >
                                Pot dona către
                            </button>
                            <button
                                type="button"
                                className={`compatToggleBtn ${directie === 'primesc' ? 'compatToggleBtnActive' : ''}`}
                                onClick={() => setDirectie('primesc')}
                            >
                                Pot primi de la
                            </button>
                        </div>

                        <p className="compatPrompt">Apasă pe grupa ta sanguină:</p>
                        <div className="groupPicker">
                            {grupeleSanguine.map((grupa) => (
                                <button
                                    key={grupa}
                                    className={`groupButton ${grupaSelectata === grupa ? 'groupButtonActive' : ''}`}
                                    onClick={() => setGrupaSelectata(grupa)}
                                    title={infoGrupa[grupa]}
                                >
                                    {grupa}
                                </button>
                            ))}
                        </div>

                        <div className="resultCard">
                            <AnimatePresence mode="wait">
                                {!rezultat ? (
                                    <motion.div
                                        key="empty"
                                        className="resultEmptyState"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <span className="resultEmptyIcon"><IconDrop /></span>
                                        <p className="resultEmpty">Selectează o grupă sanguină mai sus.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={grupaSelectata + directie}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <p className="resultTitle">
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
                                            className="resultGroups"
                                            variants={staggerContainer}
                                            initial="hidden"
                                            animate="show"
                                        >
                                            {rezultat.map((g) => (
                                                <motion.span key={g} className="resultGroupTag" variants={fadeUpItem}>
                                                    {g}
                                                </motion.span>
                                            ))}
                                        </motion.div>
                                        {(esteUniversal || estePrimitorUniversal) && (
                                            <div className="resultBadgeRow">
                                                <span className="universalTag">
                                                    {esteUniversal ? 'Donator universal' : 'Primitor universal'}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Nu ai avut o boală infecțioasă recentă
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Nu ai consumat alcool în ultimele 24 de ore
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Ai dormit suficient în noaptea precedentă
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck"><IconCheck /></span>
                                Nu ai făcut un tatuaj sau piercing în ultimele 4 luni
                            </li>
                        </ul>
                    </div>
                </div>

                <div id="recenzii">
                    <h2 className="sectionTitle">Ce spun utilizatorii</h2>
                    <motion.div
                        className="reviewsGrid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        {recenzii.map((r) => (
                            <motion.div key={r.nume} className="reviewCard" variants={fadeUpItem}>
                                <div className="reviewStars"><IconStar /><IconStar /><IconStar /><IconStar /><IconStar /></div>
                                <p className="reviewText">„{r.text}"</p>
                                <div className="reviewAuthor">
                                    <div className="reviewAvatar">
                                        {r.nume
                                            .split(' ')
                                            .map((w) => w[0])
                                            .join('')}
                                    </div>
                                    <div>
                                        <p className="reviewName">{r.nume}</p>
                                        <p className="reviewRole">
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
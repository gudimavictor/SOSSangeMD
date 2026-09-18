import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { IconPhone, IconMail, IconLocation, IconClock, IconWarning, IconCheck, IconBulb } from '../../components/ui/Icons'
import { PageHeader } from '../../components/ui/PageHeader'
import './SupportPage.css'

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

const intrebariFrecvente = [
    {
        intrebare: 'Cum creez o cerere de sânge?',
        raspuns:
            'Mergi la „Creează cerere", completezi grupa sanguină necesară, orașul și nivelul de urgență, apoi trimiți. Cererea devine imediat vizibilă pentru donatorii compatibili din orașul tău.',
    },
    {
        intrebare: 'Cum devin donator?',
        raspuns:
            'Mergi la „Sunt donator" și completezi grupa ta sanguină, orașul și, opțional, data ultimei donări. Profilul tău devine vizibil pentru cei care au nevoie de sânge compatibil.',
    },
    {
        intrebare: 'Cât de des pot dona sânge?',
        raspuns:
            'Conform regulilor standard, trebuie să treacă minim 2 luni între două donări. Platforma îți calculează automat data de la care poți dona din nou, pe baza ultimei donări înregistrate.',
    },
    {
        intrebare: 'Datele mele sunt vizibile public?',
        raspuns:
            'Profilul tău de donator (grupa sanguină, orașul) e vizibil doar persoanelor care caută donatori compatibili prin platformă. Datele de contact (email, telefon) nu sunt afișate public.',
    },
    {
        intrebare: 'Cum editez sau șterg o cerere?',
        raspuns:
            'Mergi la „Cererile mele", găsești cererea dorită și apeși „Editează" sau „Șterge" direct din card. Modificările se salvează instant.',
    },
    {
        intrebare: 'Ce înseamnă nivelurile de urgență?',
        raspuns:
            '„Critică" — ai nevoie de sânge acum. „Urgentă" — în câteva zile. „Programată" — ai mai mult timp la dispoziție (ex: intervenție planificată). Alegerea corectă ajută donatorii să-și prioritizeze răspunsul.',
    },
]

const contactCards = [
    { icon: IconPhone, label: 'Telefon', value: '+373 22 000 000' },
    { icon: IconMail, label: 'Email', value: 'suport@sossange.md' },
    { icon: IconLocation, label: 'Locație', value: 'Chișinău, Moldova' },
    { icon: IconClock, label: 'Program', value: 'Luni–Vineri, 09:00–18:00' },
]

export function SupportPage() {
    const [faqDeschis, setFaqDeschis] = useState<number | null>(null)
    const [nume, setNume] = useState('')
    const [email, setEmail] = useState('')
    const [mesaj, setMesaj] = useState('')
    const [trimis, setTrimis] = useState(false)

    function toggleFaq(index: number) {
        setFaqDeschis((prev) => (prev === index ? null : index))
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!nume || !email || !mesaj) return

        setTrimis(true)
        setNume('')
        setEmail('')
        setMesaj('')

        setTimeout(() => setTrimis(false), 4000)
    }

    return (
        <div className="supportPage">
            <PageHeader
                className="supportPageHeader"
                icon={<IconBulb />}
                eyebrow="Ajutor și contact"
                title="Suport"
                subtitle="Găsești răspunsuri rapide mai jos, sau ne poți scrie direct."
            />

            <div className="supportBody">
                <motion.div
                    className="urgencyBanner"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className="urgencyBannerIcon">
                        <IconWarning />
                    </span>
                    <div className="urgencyBannerText">
                        <p className="urgencyBannerTitle">Ai o urgență medicală reală?</p>
                        <p className="urgencyBannerDesc">
                            Această pagină e pentru întrebări despre platformă, nu pentru urgențe. Sună la{' '}
                            <strong>112</strong> sau mergi direct la cel mai apropiat{' '}
                            <Link to="/centre" className="urgencyBannerLink">
                                centru de transfuzie
                            </Link>
                            .
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="contactCardsGrid"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    {contactCards.map((c) => (
                        <motion.div key={c.label} className="contactCard" variants={fadeUpItem}>
                            <span className="contactCardIcon">
                                <c.icon />
                            </span>
                            <div>
                                <p className="contactCardLabel">{c.label}</p>
                                <p className="contactCardValue">{c.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="supportGrid">
                    <div className="faqColumn">
                        <h2 className="supportSectionTitle">Întrebări frecvente</h2>
                        <div className="faqList">
                            {intrebariFrecvente.map((item, index) => {
                                const esteDeschis = faqDeschis === index
                                return (
                                    <div key={item.intrebare} className="faqItem">
                                        <button
                                            type="button"
                                            className="faqQuestion"
                                            onClick={() => toggleFaq(index)}
                                        >
                                            <span>{item.intrebare}</span>
                                            <motion.span
                                                className="faqArrow"
                                                animate={{ rotate: esteDeschis ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                ▼
                                            </motion.span>
                                        </button>
                                        <AnimatePresence>
                                            {esteDeschis && (
                                                <motion.div
                                                    className="faqAnswerWrap"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                >
                                                    <p className="faqAnswer">{item.raspuns}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="formColumn">
                        <h2 className="supportSectionTitle">Scrie-ne</h2>
                        <form className="supportForm" onSubmit={handleSubmit}>
                            <div className="supportFormField">
                                <label htmlFor="nume">Nume</label>
                                <input
                                    id="nume"
                                    type="text"
                                    value={nume}
                                    onChange={(e) => setNume(e.target.value)}
                                    placeholder="Numele tău"
                                    required
                                />
                            </div>
                            <div className="supportFormField">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@exemplu.md"
                                    required
                                />
                            </div>
                            <div className="supportFormField">
                                <label htmlFor="mesaj">Mesaj</label>
                                <textarea
                                    id="mesaj"
                                    rows={5}
                                    value={mesaj}
                                    onChange={(e) => setMesaj(e.target.value)}
                                    placeholder="Descrie problema sau întrebarea ta..."
                                    required
                                />
                            </div>

                            <motion.button
                                type="submit"
                                className="supportSubmitButton"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Trimite mesajul
                            </motion.button>

                            <AnimatePresence>
                                {trimis && (
                                    <motion.div
                                        className="supportSuccessBox"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <span className="iconText">
                                            <IconCheck /> Mesajul a fost trimis! Îți răspundem în cel mai scurt timp.
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
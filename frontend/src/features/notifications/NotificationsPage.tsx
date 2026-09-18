import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { getNotificationsByUser, markAsRead, markAllAsRead } from './notificationsStore'
import { IconUsers, IconDrop, IconBell, IconMail } from '../../components/ui/Icons'
import { PageHeader } from '../../components/ui/PageHeader'
import './NotificationsPage.css'

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

function timpRelativ(dataIso: string) {
    const data = new Date(dataIso)
    const acum = new Date()
    const diffMinute = Math.floor((acum.getTime() - data.getTime()) / 60000)

    if (diffMinute < 1) return 'acum câteva secunde'
    if (diffMinute < 60) return `acum ${diffMinute} min`

    const ore = Math.floor(diffMinute / 60)
    if (ore < 24) return `acum ${ore} ${ore === 1 ? 'oră' : 'ore'}`

    const zile = Math.floor(ore / 24)
    return `acum ${zile} ${zile === 1 ? 'zi' : 'zile'}`
}

export function NotificationsPage() {
    const { user } = useAuth()
    const [, setVersiune] = useState(0)
    const [deschise, setDeschise] = useState<Set<string>>(new Set())
    const refresh = () => setVersiune((v) => v + 1)

    if (!user) {
        return (
            <div className="notifPage">
                <PageHeader
                    className="notifPageHeader"
                    icon={<IconBell />}
                    eyebrow="Notificări"
                    title="Notificările tale"
                    subtitle="Autentifică-te ca să-ți vezi notificările."
                />
                <div className="notifBody">
                    <div className="notifLoginPrompt">
                        <p>Trebuie să fii autentificat ca să vezi notificările.</p>
                        <Link to="/login" search={{ redirect: '/notificari' }} className="notifCta">
                            Autentifică-te
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const notificari = getNotificationsByUser(user.id)
    const necitite = notificari.filter((n) => !n.citita).length

    function toggleDeschis(n: (typeof notificari)[number]) {
        setDeschise((prev) => {
            const next = new Set(prev)
            if (next.has(n.id)) {
                next.delete(n.id)
            } else {
                next.add(n.id)
            }
            return next
        })
        if (!n.citita) {
            markAsRead(n.id)
            refresh()
        }
    }

    function handleMarkAllRead() {
        markAllAsRead(user!.id)
        refresh()
    }

    return (
        <div className="notifPage">
            <PageHeader
                className="notifPageHeader"
                icon={<IconBell />}
                eyebrow="Notificări"
                title="Notificările tale"
                subtitle={necitite > 0 ? `Ai ${necitite} notificări necitite.` : 'Ești la zi cu toate notificările.'}
            />

            <div className="notifBody">
                {notificari.length > 0 && necitite > 0 && (
                    <button className="notifMarkAllButton" onClick={handleMarkAllRead}>
                        Marchează tot ca citit
                    </button>
                )}

                {notificari.length === 0 ? (
                    <div className="notifEmptyState">
                        <span className="notifEmptyIcon">
                            <IconDrop />
                        </span>
                        <p>Nu ai nicio notificare momentan.</p>
                    </div>
                ) : (
                    <motion.div className="notifList" variants={staggerContainer} initial="hidden" animate="show">
                        <AnimatePresence>
                            {notificari.map((n) => {
                                const esteDeschis = deschise.has(n.id)
                                return (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        variants={fadeUpItem}
                                        className={`notifCard notifCardClickable ${!n.citita ? 'notifCardUnread' : ''}`}
                                        onClick={() => toggleDeschis(n)}
                                    >
                                        <span className="notifCardIcon">
                                            {n.tip === 'confirmare' ? (
                                                <IconUsers />
                                            ) : n.tip === 'raspuns_suport' ? (
                                                <IconMail />
                                            ) : (
                                                <IconDrop />
                                            )}
                                        </span>
                                        <div className="notifCardBody">
                                            <div className="notifCardTitleRow">
                                                <p className="notifCardTitle">{n.titlu}</p>
                                                <span className="notifCardTime">{timpRelativ(n.data)}</span>
                                            </div>
                                            <AnimatePresence>
                                                {esteDeschis && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        style={{ overflow: 'hidden' }}
                                                    >
                                                        <p className="notifCardMessage">{n.mesaj}</p>
                                                        {n.link && (
                                                            <Link to={n.link} className="notifCardLink">
                                                                Vezi detalii
                                                            </Link>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        {!n.citita && <span className="notifUnreadDot" title="Necitită" />}
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
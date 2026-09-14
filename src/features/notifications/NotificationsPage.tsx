import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { getNotificationsByUser, markAsRead, markAllAsRead } from './notificationsStore'
import { IconCheck, IconUsers, IconDrop } from '../../components/ui/Icons'
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
    const refresh = () => setVersiune((v) => v + 1)

    if (!user) {
        return (
            <div className="notifPage">
                <div className="notifPageHeader">
                    <span className="notifEyebrow">Notificări</span>
                    <h1 className="notifPageTitle">Notificările tale</h1>
                    <p className="notifPageSubtitle">Autentifică-te ca să-ți vezi notificările.</p>
                </div>
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

    function handleMarkRead(id: string) {
        markAsRead(id)
        refresh()
    }

    function handleMarkAllRead() {
        markAllAsRead(user!.id)
        refresh()
    }

    return (
        <div className="notifPage">
            <motion.div className="notifPageHeader" variants={staggerContainer} initial="hidden" animate="show">
                <motion.span className="notifEyebrow" variants={fadeUpItem}>
                    Notificări
                </motion.span>
                <motion.h1 className="notifPageTitle" variants={fadeUpItem}>
                    Notificările tale
                </motion.h1>
                <motion.p className="notifPageSubtitle" variants={fadeUpItem}>
                    {necitite > 0 ? `Ai ${necitite} notificări necitite.` : 'Ești la zi cu toate notificările.'}
                </motion.p>
            </motion.div>

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
                            {notificari.map((n) => (
                                <motion.div
                                    key={n.id}
                                    layout
                                    variants={fadeUpItem}
                                    className={`notifCard ${!n.citita ? 'notifCardUnread' : ''}`}
                                >
                                    <span className="notifCardIcon">
                                        {n.tip === 'confirmare' ? <IconUsers /> : <IconDrop />}
                                    </span>
                                    <div className="notifCardBody">
                                        <p className="notifCardTitle">{n.titlu}</p>
                                        <p className="notifCardMessage">{n.mesaj}</p>
                                        <div className="notifCardFooter">
                                            <span className="notifCardTime">{timpRelativ(n.data)}</span>
                                            {n.link && (
                                                <Link to={n.link} className="notifCardLink">
                                                    Vezi detalii
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {!n.citita && (
                                        <button
                                            className="notifMarkButton"
                                            onClick={() => handleMarkRead(n.id)}
                                            title="Marchează citită"
                                        >
                                            <IconCheck />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
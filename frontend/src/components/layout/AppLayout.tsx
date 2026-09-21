import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/AuthContext'
import { NOTIFICATIONS_UPDATED_EVENT } from '../../api/notifications'
import { useApi } from '../../api/use-api'
import { IconBell } from '../ui/Icons'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { Footer } from './Footer'
import './AppLayout.css'

type AppLayoutProps = {
    children: ReactNode
}

function initiale(nume: string) {
    return nume
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

const navItems = [
    { to: '/', key: 'home', authOnly: false, adminOnly: false },
    { to: '/creeaza-cerere', key: 'createRequest', authOnly: false, adminOnly: false },
    { to: '/cererile-mele', key: 'myRequests', authOnly: true, adminOnly: false },
    { to: '/sunt-donator', key: 'donor', authOnly: false, adminOnly: false },
    { to: '/cereri-compatibile', key: 'compatibleRequests', authOnly: true, adminOnly: false },
    { to: '/centre', key: 'centers', authOnly: false, adminOnly: false },
    { to: '/suport', key: 'support', authOnly: false, adminOnly: false },
    { to: '/admin', key: 'admin', authOnly: true, adminOnly: true },
]

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth()
    const api = useApi()
    const { t } = useTranslation('layout')
    const navigate = useNavigate()
    const location = useLocation()
    const [necitite, setNecitite] = useState(0)
    const [notifVersiune, setNotifVersiune] = useState(0)
    const userId = user?.id ?? null

    useEffect(() => {
        function handleUpdate() {
            setNotifVersiune((v) => v + 1)
        }
        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate)
        const interval = window.setInterval(handleUpdate, 30_000)
        return () => {
            window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate)
            window.clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        if (!userId) return
        let anulat = false
        api.notifications
            .listMyNotifications()
            .then((lista) => {
                if (!anulat) setNecitite(lista.filter((n) => !n.citita).length)
            })
            .catch(() => {})
        return () => {
            anulat = true
        }
    }, [api, userId, notifVersiune, location.pathname])

    const badge = user ? necitite : 0

    async function handleLogout() {
        await logout()
        navigate({ to: '/login' })
    }

    const esteParinaAuth = location.pathname === '/login'

    if (esteParinaAuth) {
        return <div className="appShell">{children}</div>
    }

    return (
        <div className="appShell">
            <header className="topnav">
                <span className="brand">SOS Sânge</span>

                <nav className="navList">
                    {navItems
                        .filter((item) => (!item.authOnly || user) && (!item.adminOnly || user?.esteAdmin))
                        .map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="navLink"
                                activeProps={{ className: 'navLink navLinkActive' }}
                                activeOptions={{ exact: item.to === '/' }}
                            >
                                {t(`nav.${item.key}`)}
                            </Link>
                        ))}
                </nav>

                <div className="userArea">
                    <LanguageSwitcher />
                    {user && (
                        <Link to="/notificari" className="notifBellLink" title={t('nav.notifications')}>
                            <IconBell />
                            {badge > 0 && <span className="notifBellBadge">{badge > 9 ? '9+' : badge}</span>}
                        </Link>
                    )}

                    {user ? (
                        <>
                            <Link to="/profil" className="topbarUser">
                                <span className="topbarAvatar">{initiale(user.nume)}</span>
                                <span className="topbarUserName">{user.nume}</span>
                            </Link>
                            <button className="logoutButton" onClick={handleLogout}>
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="navLink">
                            {t('nav.login')}
                        </Link>
                    )}
                </div>
            </header>

            <main className="pageContent">{children}</main>

            <Footer />
        </div>
    )
}
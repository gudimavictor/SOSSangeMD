import type { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../../features/auth/AuthContext'
import { getUnreadCount } from '../../features/notifications/notificationsStore'
import { IconBell } from '../ui/Icons'
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
    { to: '/', label: 'Acasă', authOnly: false, adminOnly: false },
    { to: '/creeaza-cerere', label: 'Creează cerere', authOnly: false, adminOnly: false },
    { to: '/cererile-mele', label: 'Cererile mele', authOnly: true, adminOnly: false },
    { to: '/sunt-donator', label: 'Sunt donator', authOnly: false, adminOnly: false },
    { to: '/cereri-compatibile', label: 'Cereri compatibile', authOnly: true, adminOnly: false },
    { to: '/centre', label: 'Centre', authOnly: false, adminOnly: false },
    { to: '/suport', label: 'Suport', authOnly: false, adminOnly: false },
    { to: '/admin', label: 'Admin', authOnly: true, adminOnly: true },
]

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    function handleLogout() {
        logout()
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
                                {item.label}
                            </Link>
                        ))}
                </nav>

                <div className="userArea">
                    {user && (
                        <Link to="/notificari" className="notifBellLink" title="Notificări">
                            <IconBell />
                            {getUnreadCount(user.id) > 0 && (
                                <span className="notifBellBadge">
                                    {getUnreadCount(user.id) > 9 ? '9+' : getUnreadCount(user.id)}
                                </span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <>
                            <Link to="/profil" className="topbarUser">
                                <span className="topbarAvatar">{initiale(user.nume)}</span>
                                <span className="topbarUserName">{user.nume}</span>
                            </Link>
                            <button className="logoutButton" onClick={handleLogout}>
                                Ieși
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="navLink">
                            Autentificare
                        </Link>
                    )}
                </div>
            </header>

            <main className="pageContent">{children}</main>

            <Footer />
        </div>
    )
}
import type { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '../../features/auth/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { Footer } from './Footer'
import './AppLayout.css'

type AppLayoutProps = {
    children: ReactNode
}

const navItems = [
    { to: '/', label: 'Acasă' },
    { to: '/creeaza-cerere', label: 'Creează cerere' },
    { to: '/cererile-mele', label: 'Cererile mele' },
    { to: '/sunt-donator', label: 'Sunt donator' },
    { to: '/cereri-compatibile', label: 'Cereri compatibile' },
    { to: '/centre', label: 'Centre' },
    { to: '/suport', label: 'Suport' },
]

function IconSun() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    )
}

function IconMoon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()

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
                <span className="brand">SOS Sânge MD</span>

                <nav className="navList">
                    {navItems.map((item) => (
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
                    <button className="themeToggle" onClick={toggleTheme} title="Schimbă tema">
                        {theme === 'light' ? <IconMoon /> : <IconSun />}
                    </button>

                    {user ? (
                        <>
                            <span className="topbarUser">
                                <span className="topbarUserName">{user.nume}</span>
                            </span>
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
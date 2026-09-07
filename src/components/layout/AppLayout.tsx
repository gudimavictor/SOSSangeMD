import type { ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../features/auth/AuthContext'
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

export function AppLayout({ children }: AppLayoutProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate({ to: '/login' })
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

                {user && (
                    <div className="userArea">
                        <span className="topbarUser">
                            <span className="topbarUserName">{user.nume}</span>
                        </span>
                        <button className="logoutButton" onClick={handleLogout}>
                            Ieși
                        </button>
                    </div>
                )}
            </header>

            <main className="pageContent">{children}</main>
        </div>
    )
}
import { Link } from '@tanstack/react-router'
import { mockRequests } from '../requests/mockRequests'
import './HomePage.css'

type NavItem = {
    to: string
    title: string
    description: string
}

const navItems: NavItem[] = [
    { to: '/creeaza-cerere', title: 'Creează cerere', description: 'Ai nevoie urgentă de sânge' },
    { to: '/cererile-mele', title: 'Cererile mele', description: 'Urmărește statusul cererilor tale' },
    { to: '/sunt-donator', title: 'Sunt donator', description: 'Înregistrează-te ca donator' },
    { to: '/cereri-compatibile', title: 'Cereri compatibile', description: 'Vezi cereri pentru grupa ta' },
    { to: '/centre', title: 'Centre de transfuzie', description: 'Găsește un centru aproape de tine' },
]

export function HomePage() {
    const cereriActive = mockRequests.filter((r) => r.status === 'activa')
    const cereriCritice = cereriActive.filter((r) => r.urgenta === 'critica')

    return (
        <div className="page">
            <div className="hero">
                <h1 className="heroTitle">SOS Sânge MD</h1>
                <p className="heroSubtitle">
                    Conectăm rapid pacienții cu donatori compatibili, exact atunci când timpul contează cel mai mult.
                </p>
            </div>

            <div className="body">
                <div className="statsRow">
                    <div className="statItem">
                        <span className="statNumber">{cereriActive.length}</span>
                        <span className="statLabel">Cereri active</span>
                    </div>
                    <div className="statItem">
                        <span className="statNumber">{cereriCritice.length}</span>
                        <span className="statLabel">Cereri critice</span>
                    </div>
                    <div className="statItem">
                        <span className="statNumber">5</span>
                        <span className="statLabel">Centre de transfuzie</span>
                    </div>
                </div>

                <h2 className="sectionTitle">Ce vrei să faci?</h2>

                <div className="navGrid">
                    {navItems.map((item) => (
                        <Link key={item.to} to={item.to} className="navCard">
                            <p className="navCardTitle">{item.title}</p>
                            <p className="navCardDesc">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
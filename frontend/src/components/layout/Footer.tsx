import { Link } from '@tanstack/react-router'
import './Footer.css'

const linkuriRapide = [
    { to: '/', label: 'Acasă' },
    { to: '/creeaza-cerere', label: 'Creează cerere' },
    { to: '/sunt-donator', label: 'Sunt donator' },
    { to: '/cereri-compatibile', label: 'Cereri compatibile' },
    { to: '/centre', label: 'Centre de transfuzie' },
    { to: '/suport', label: 'Suport' },
    { to: '/despre-noi', label: 'Despre noi' },
]

function IconDrop() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5s6.5 7.2 6.5 12a6.5 6.5 0 0 1-13 0c0-4.8 6.5-12 6.5-12z" />
        </svg>
    )
}

function IconPhone() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.05 5.5a5 5 0 0 1 4.45 4.45M14.5 2a9 9 0 0 1 8 8M21 16.9v2.6a1.5 1.5 0 0 1-1.63 1.5 14.9 14.9 0 0 1-6.49-2.31 14.7 14.7 0 0 1-4.52-4.52A14.9 14.9 0 0 1 5.05 7.63 1.5 1.5 0 0 1 6.54 6h2.6a1.5 1.5 0 0 1 1.5 1.29c.1.75.28 1.49.55 2.19a1.5 1.5 0 0 1-.34 1.58l-1.1 1.1a12 12 0 0 0 4.52 4.52l1.1-1.1a1.5 1.5 0 0 1 1.58-.34c.7.27 1.44.45 2.19.55a1.5 1.5 0 0 1 1.29 1.52z" />
        </svg>
    )
}

function IconMail() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
            <path d="m3 6.5 9 6.5 9-6.5" />
        </svg>
    )
}

function IconPin() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10.5" r="2.7" />
        </svg>
    )
}

function IconFacebook() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.47c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.91v2.18H8v2.96h2.46V21z" />
        </svg>
    )
}

function IconInstagram() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
        </svg>
    )
}

export function Footer() {
    const anul = new Date().getFullYear()

    return (
        <footer className="siteFooter">
            <div className="footerTop">
                <div className="footerBrand">
                    <span className="footerLogoRow">
                        <IconDrop />
                        SOS Sânge
                    </span>
                    <p className="footerDescription">
                        Conectăm donatori de sânge cu persoane care au nevoie urgentă,
                        în toată Republica Moldova. Fiecare donare poate salva o viață.
                    </p>
                    <div className="footerSocial">
                        <a href="#" className="footerSocialLink" aria-label="Facebook" target="_blank" rel="noreferrer">
                            <IconFacebook />
                        </a>
                        <a href="#" className="footerSocialLink" aria-label="Instagram" target="_blank" rel="noreferrer">
                            <IconInstagram />
                        </a>
                        <a href="mailto:contact@sossange.md" className="footerSocialLink" aria-label="Email">
                            <IconMail />
                        </a>
                    </div>
                </div>

                <div className="footerCol">
                    <h4 className="footerColTitle">Linkuri rapide</h4>
                    <ul className="footerLinkList">
                        {linkuriRapide.map((item) => (
                            <li key={item.to}>
                                <Link to={item.to} className="footerLink">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footerCol">
                    <h4 className="footerColTitle">Contact</h4>
                    <ul className="footerContactList">
                        <li>
                            <IconPhone />
                            <span>+373 22 000 000</span>
                        </li>
                        <li>
                            <IconMail />
                            <span>contact@sossange.md</span>
                        </li>
                        <li>
                            <IconPin />
                            <span>Chișinău, Moldova</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footerBottom">
                <span className="footerCopy">© {anul} SOS Sânge. Proiect de practică.</span>
            </div>
        </footer>
    )
}
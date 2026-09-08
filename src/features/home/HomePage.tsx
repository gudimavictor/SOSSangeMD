import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { mockRequests } from '../requests/mockRequests'
import { esteCompatibil, grupeleSanguine } from '../requests/compatibilitate'
import type { GrupaSanguina } from '../auth/AuthContext'
import './HomePage.css'

function grupeCareOtePotPrimi(grupaDonator: GrupaSanguina) {
    return grupeleSanguine.filter((grupaNecesara) =>
        esteCompatibil(grupaDonator, grupaNecesara)
    )
}

export function HomePage() {
    const cereriActive = mockRequests.filter((r) => r.status === 'activa')
    const cereriCritice = cereriActive.filter((r) => r.urgenta === 'critica')

    const [grupaSelectata, setGrupaSelectata] = useState<GrupaSanguina | null>(null)
    const rezultat = grupaSelectata ? grupeCareOtePotPrimi(grupaSelectata) : null
    const esteUniversal = grupaSelectata === 'O-'
    const estePrimitorUniversal = grupaSelectata === 'AB+'

    return (
        <div className="page">
            <div className="hero">
                <h1 className="heroTitle">SOS Sânge MD</h1>
                <p className="heroSubtitle">
                    Conectăm rapid pacienții cu donatori compatibili, exact atunci când timpul contează cel mai mult.
                </p>
                <div className="heroActions">
                    <Link to="/creeaza-cerere" className="heroButton heroButtonPrimary">
                        Am nevoie de sânge
                    </Link>
                    <Link to="/sunt-donator" className="heroButton heroButtonSecondary">
                        Vreau să donez
                    </Link>
                </div>
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

                <div className="motivational">
                    <span className="motivationalIcon">❤️</span>
                    <p className="motivationalText">
                        O singură donare de sânge poate salva până la 3 vieți.
                    </p>
                </div>

                <h2 className="sectionTitle">Cum funcționează</h2>
                <div className="stepsGrid">
                    <div className="stepCard">
                        <span className="stepNumber">1</span>
                        <p className="stepTitle">Creezi o cerere</p>
                        <p className="stepDesc">
                            Completezi grupa sanguină necesară, orașul și nivelul de urgență, pentru tine sau un apropiat.
                        </p>
                    </div>
                    <div className="stepCard">
                        <span className="stepNumber">2</span>
                        <p className="stepTitle">Sistemul caută donatori</p>
                        <p className="stepDesc">
                            Platforma identifică automat donatorii compatibili, din același oraș, eligibili să doneze.
                        </p>
                    </div>
                    <div className="stepCard">
                        <span className="stepNumber">3</span>
                        <p className="stepTitle">Donatorul confirmă</p>
                        <p className="stepDesc">
                            Donatorul vede cererea și confirmă disponibilitatea. Vă puteți conecta rapid.
                        </p>
                    </div>
                </div>

                <h2 className="sectionTitle">Verifică-ți compatibilitatea</h2>
                <div className="compatSection">
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Apasă pe grupa ta sanguină:
                        </p>
                        <div className="groupPicker">
                            {grupeleSanguine.map((grupa) => (
                                <button
                                    key={grupa}
                                    className={`groupButton ${grupaSelectata === grupa ? 'groupButtonActive' : ''}`}
                                    onClick={() => setGrupaSelectata(grupa)}
                                >
                                    {grupa}
                                </button>
                            ))}
                        </div>

                        <div className="resultCard">
                            {!rezultat ? (
                                <p className="resultEmpty">Selectează o grupă sanguină, ca să vezi cu cine ești compatibil.</p>
                            ) : (
                                <div>
                                    <p className="resultTitle">
                                        Cu grupa <strong>{grupaSelectata}</strong>, poți dona către:
                                    </p>
                                    <div className="resultGroups">
                                        {rezultat.map((g) => (
                                            <span key={g} className="resultGroupTag">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                    {(esteUniversal || estePrimitorUniversal) && (
                                        <div className="resultBadgeRow">
                                            <span className="universalTag">
                                                {esteUniversal ? 'Donator universal' : 'Primitor universal'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="eligibilityCard">
                        <p className="eligibilityTitle">Cine poate dona sânge?</p>
                        <ul className="eligibilityList">
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Vârsta între 18 și 60 de ani
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Greutate minimă de 50 kg
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Stare generală bună de sănătate
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Au trecut minim 2 luni de la ultima donare
                            </li>
                            <li className="eligibilityItem">
                                <span className="eligibilityCheck">✓</span>
                                Nu ai avut o boală infecțioasă recentă
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
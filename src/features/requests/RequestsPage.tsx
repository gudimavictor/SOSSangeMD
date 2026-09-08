import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../auth/AuthContext'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { grupeleSanguine } from './compatibilitate'
import type { NivelUrgenta } from './types'
import './RequestsPage.css'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

const descriereRapida = [
    'Intervenție chirurgicală urgentă',
    'Accident, transfuzie necesară',
    'Naștere, complicații',
    'Boală cronică, transfuzii regulate',
]

const urgencyInfo: { value: NivelUrgenta; title: string; desc: string }[] = [
    { value: 'critica', title: 'Critică', desc: 'Ai nevoie acum' },
    { value: 'urgenta', title: 'Urgentă', desc: 'În câteva zile' },
    { value: 'programata', title: 'Programată', desc: 'Mai mult timp' },
]

export function CreateRequestPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [grupa, setGrupa] = useState('')
    const [oras, setOras] = useState(user?.oras ?? '')
    const [urgenta, setUrgenta] = useState<NivelUrgenta>('urgenta')
    const [descriere, setDescriere] = useState('')
    const [trimis, setTrimis] = useState(false)

    function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (!grupa || !oras) return

        // La conectarea cu backend-ul real, aici se trimite cererea catre API
        setTrimis(true)

        setTimeout(() => {
            navigate({ to: '/cererile-mele' })
        }, 1200)
    }

    return (
        <div className="requestsPage">
            <div className="reqHero">
                <h1 className="reqHeroTitle">Creează o cerere de sânge</h1>
                <p className="reqHeroSubtitle">
                    Completează detaliile — sistemul va căuta automat donatori compatibili
                </p>
            </div>

            <div className="reqBody">
                <div className="formColumn">
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="formRow">
                            <div className="formField">
                                <label>Grupa sanguină necesară</label>
                                <CustomSelect
                                    options={grupeleSanguine}
                                    value={grupa}
                                    onChange={setGrupa}
                                    placeholder="Selectează grupa"
                                />
                            </div>
                            <div className="formField">
                                <label>Oraș</label>
                                <CustomSelect
                                    options={orase}
                                    value={oras}
                                    onChange={setOras}
                                    placeholder="Selectează orașul"
                                />
                            </div>
                        </div>

                        <div className="formRow" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="formField">
                                <label>Nivel de urgență</label>
                                <div className="urgencyPicker">
                                    {urgencyInfo.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={`urgencyOption urgencyOption--${item.value} ${urgenta === item.value ? 'urgencyOptionActive' : ''}`}
                                            onClick={() => setUrgenta(item.value)}
                                        >
                                            <div className="urgencyOptionTitle">{item.title}</div>
                                            <div className="urgencyOptionDesc">{item.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="formRow" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="formField">
                                <label htmlFor="descriere">Descriere</label>
                                <div className="quickFills">
                                    {descriereRapida.map((text) => (
                                        <button
                                            key={text}
                                            type="button"
                                            className="quickFillChip"
                                            onClick={() => setDescriere(text)}
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    id="descriere"
                                    rows={3}
                                    value={descriere}
                                    onChange={(e) => setDescriere(e.target.value)}
                                    placeholder="Ex: Am nevoie de sânge pentru o intervenție chirurgicală urgentă..."
                                />
                            </div>
                        </div>

                        <button type="submit" className="submitButton">
                            Trimite cererea
                        </button>

                        {trimis && (
                            <div className="successBox">
                                Cererea a fost trimisă! Te redirecționăm spre "Cererile mele"...
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
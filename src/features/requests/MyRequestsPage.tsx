import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../auth/AuthContext'
import { getRequestsByUser, updateRequestStatus } from './requestsStore'
import type { BloodRequest, StatusCerere } from './types'
import './MyRequestsPage.css'

type Tab = 'active' | 'rezolvate' | 'toate'

const tabInfo: { value: Tab; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'rezolvate', label: 'Rezolvate' },
    { value: 'toate', label: 'Toate' },
]

const statusLabel: Record<StatusCerere, string> = {
    activa: 'Activă',
    rezolvata: 'Rezolvată',
    expirata: 'Expirată',
}

function formateazaData(data: string) {
    return new Date(data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function MyRequestsPage() {
    const { user } = useAuth()
    const [tab, setTab] = useState<Tab>('active')
    const [versiune, setVersiune] = useState(0)

    if (!user) {
        return (
            <div className="myReqPage">
                <div className="myReqHero">
                    <h1 className="myReqHeroTitle">Cererile mele</h1>
                    <p className="myReqHeroSubtitle">Urmărește statusul cererilor tale de sânge, într-un singur loc.</p>
                </div>

                <div className="myReqBody">
                    <div className="myReqLoginPrompt">
                        <p>Trebuie să fii autentificat ca să-ți vezi cererile.</p>
                        <Link to="/login" search={{ redirect: '/cererile-mele' }} className="myReqCta">
                            Autentifică-te
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const toateCererile = getRequestsByUser(user.id)
    const active = toateCererile.filter((r) => r.status === 'activa')
    const rezolvate = toateCererile.filter((r) => r.status === 'rezolvata')

    const listaAfisata: BloodRequest[] =
        tab === 'active' ? active : tab === 'rezolvate' ? rezolvate : toateCererile

    function marcheazaRezolvata(id: string) {
        updateRequestStatus(id, 'rezolvata')
        setVersiune((v) => v + 1)
    }

    return (
        <div className="myReqPage">
            <div className="myReqHero">
                <h1 className="myReqHeroTitle">Cererile mele</h1>
                <p className="myReqHeroSubtitle">Urmărește statusul cererilor tale de sânge, într-un singur loc.</p>
            </div>

            <div className="myReqBody">
                <div className="myReqStatsRow">
                    <div className="myReqStatItem">
                        <span className="myReqStatNumber">{toateCererile.length}</span>
                        <span className="myReqStatLabel">Total cereri</span>
                    </div>
                    <div className="myReqStatItem">
                        <span className="myReqStatNumber">{active.length}</span>
                        <span className="myReqStatLabel">Active</span>
                    </div>
                    <div className="myReqStatItem">
                        <span className="myReqStatNumber">{rezolvate.length}</span>
                        <span className="myReqStatLabel">Rezolvate</span>
                    </div>
                </div>

                <div className="myReqTabs">
                    {tabInfo.map((item) => (
                        <button
                            key={item.value}
                            className={`myReqTab ${tab === item.value ? 'myReqTabActive' : ''}`}
                            onClick={() => setTab(item.value)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {listaAfisata.length === 0 ? (
                    <div className="myReqEmptyState">
                        <p>
                            {tab === 'active' && 'Nu ai nicio cerere activă momentan.'}
                            {tab === 'rezolvate' && 'Nu ai nicio cerere rezolvată încă.'}
                            {tab === 'toate' && 'Nu ai creat nicio cerere de sânge.'}
                        </p>
                        <Link to="/creeaza-cerere" className="myReqCta">
                            Creează o cerere
                        </Link>
                    </div>
                ) : (
                    <div className="myReqList" key={versiune}>
                        {listaAfisata.map((r) => (
                            <div key={r.id} className="myReqCard">
                                <div className="myReqCardTop">
                                    <span className="myReqGroup">{r.grupaNecesara}</span>
                                    <div className="myReqBadges">
                                        <span className={`myReqUrgency myReqUrgency--${r.urgenta}`}>{r.urgenta}</span>
                                        <span className={`myReqStatus myReqStatus--${r.status}`}>
                                            {statusLabel[r.status]}
                                        </span>
                                    </div>
                                </div>

                                <p className="myReqDesc">{r.descriere || 'Fără descriere.'}</p>

                                <div className="myReqCardFooter">
                                    <span className="myReqCity">{r.oras}</span>
                                    <span className="myReqDate">{formateazaData(r.dataCreare)}</span>
                                </div>

                                {r.status === 'activa' && (
                                    <button className="myReqResolveButton" onClick={() => marcheazaRezolvata(r.id)}>
                                        Marchează rezolvată
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
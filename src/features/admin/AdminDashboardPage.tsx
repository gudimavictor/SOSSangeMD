import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../auth/AuthContext'
import { getUsers, setAdmin, deleteUser } from '../auth/usersStore'
import type { UserRecord } from '../auth/usersStore'
import { getRequests, updateRequestStatus, deleteRequest } from '../requests/requestsStore'
import type { StatusCerere } from '../requests/types'
import { getCenters, addCenter, updateCenter, deleteCenter } from '../centers/centersStore'
import type { CentruTransfuzie } from '../centers/centers'
import './AdminDashboardPage.css'

type Tab = 'statistici' | 'cereri' | 'utilizatori' | 'centre'

const tabInfo: { value: Tab; label: string }[] = [
    { value: 'statistici', label: 'Statistici' },
    { value: 'cereri', label: 'Cereri' },
    { value: 'utilizatori', label: 'Utilizatori' },
    { value: 'centre', label: 'Centre' },
]

const statusOptions: StatusCerere[] = ['activa', 'rezolvata', 'expirata']

const statusLabel: Record<StatusCerere, string> = {
    activa: 'Activă',
    rezolvata: 'Rezolvată',
    expirata: 'Expirată',
}

const centruGol: CentruTransfuzie = {
    id: '',
    nume: '',
    oras: '',
    adresa: '',
    telefon: '',
    program: '',
    lat: 0,
    lng: 0,
}

export function AdminDashboardPage() {
    const { user } = useAuth()
    const [tab, setTab] = useState<Tab>('statistici')
    const [versiune, setVersiune] = useState(0)
    const refresh = () => setVersiune((v) => v + 1)

    if (!user) {
        return (
            <div className="adminPage">
                <div className="adminHero">
                    <h1 className="adminHeroTitle">Admin Dashboard</h1>
                    <p className="adminHeroSubtitle">Zonă restricționată — necesită autentificare.</p>
                </div>
                <div className="adminBody">
                    <div className="adminLoginPrompt">
                        <p>Trebuie să fii autentificat ca să accesezi această pagină.</p>
                        <Link to="/login" search={{ redirect: '/admin' }} className="adminCta">
                            Autentifică-te
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (!user.esteAdmin) {
        return (
            <div className="adminPage">
                <div className="adminHero">
                    <h1 className="adminHeroTitle">Admin Dashboard</h1>
                    <p className="adminHeroSubtitle">Zonă restricționată.</p>
                </div>
                <div className="adminBody">
                    <div className="adminLoginPrompt">
                        <p>Contul tău nu are drepturi de administrator.</p>
                    </div>
                </div>
            </div>
        )
    }

    const users = getUsers()
    const requests = getRequests()
    const centers = getCenters()
    const currentUserId = user.id

    const totalDonatori = users.filter((u) => u.esteDonator).length
    const cereriActive = requests.filter((r) => r.status === 'activa').length
    const cereriRezolvate = requests.filter((r) => r.status === 'rezolvata').length

    function handleStatusChange(id: string, status: StatusCerere) {
        updateRequestStatus(id, status)
        refresh()
    }

    function handleDeleteRequest(id: string) {
        deleteRequest(id)
        refresh()
    }

    function handleToggleAdmin(u: UserRecord) {
        setAdmin(u.id, !u.esteAdmin)
        refresh()
    }

    function handleDeleteUser(u: UserRecord) {
        if (u.id === currentUserId) return
        deleteUser(u.id)
        refresh()
    }

    return (
        <div className="adminPage">
            <div className="adminHero">
                <h1 className="adminHeroTitle">Admin Dashboard</h1>
                <p className="adminHeroSubtitle">Gestionează cereri, utilizatori și centre de transfuzie.</p>
            </div>

            <div className="adminBody" key={versiune}>
                <div className="adminTabs">
                    {tabInfo.map((item) => (
                        <button
                            key={item.value}
                            className={`adminTab ${tab === item.value ? 'adminTabActive' : ''}`}
                            onClick={() => setTab(item.value)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {tab === 'statistici' && (
                    <div className="adminStatsGrid">
                        <div className="adminStatCard">
                            <span className="adminStatNumber">{users.length}</span>
                            <span className="adminStatLabel">Utilizatori</span>
                        </div>
                        <div className="adminStatCard">
                            <span className="adminStatNumber">{totalDonatori}</span>
                            <span className="adminStatLabel">Donatori</span>
                        </div>
                        <div className="adminStatCard">
                            <span className="adminStatNumber">{requests.length}</span>
                            <span className="adminStatLabel">Total cereri</span>
                        </div>
                        <div className="adminStatCard">
                            <span className="adminStatNumber">{cereriActive}</span>
                            <span className="adminStatLabel">Cereri active</span>
                        </div>
                        <div className="adminStatCard">
                            <span className="adminStatNumber">{cereriRezolvate}</span>
                            <span className="adminStatLabel">Cereri rezolvate</span>
                        </div>
                        <div className="adminStatCard">
                            <span className="adminStatNumber">{centers.length}</span>
                            <span className="adminStatLabel">Centre de transfuzie</span>
                        </div>
                    </div>
                )}

                {tab === 'cereri' && (
                    <div className="adminList">
                        {requests.length === 0 && <p className="adminEmptyState">Nu există cereri momentan.</p>}
                        {requests.map((r) => (
                            <div key={r.id} className="adminRow">
                                <div className="adminRowMain">
                                    <span className="adminRowGroup">{r.grupaNecesara}</span>
                                    <div className="adminRowInfo">
                                        <p className="adminRowTitle">{r.solicitantNume}</p>
                                        <p className="adminRowSub">
                                            {r.oras} · {r.urgenta} · {r.dataCreare}
                                        </p>
                                    </div>
                                </div>
                                <div className="adminRowActions">
                                    <select
                                        className="adminSelect"
                                        value={r.status}
                                        onChange={(e) => handleStatusChange(r.id, e.target.value as StatusCerere)}
                                    >
                                        {statusOptions.map((s) => (
                                            <option key={s} value={s}>
                                                {statusLabel[s]}
                                            </option>
                                        ))}
                                    </select>
                                    <button className="adminDeleteButton" onClick={() => handleDeleteRequest(r.id)}>
                                        Șterge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'utilizatori' && (
                    <div className="adminList">
                        {users.map((u) => (
                            <div key={u.id} className="adminRow">
                                <div className="adminRowMain">
                                    <div className="adminRowInfo">
                                        <p className="adminRowTitle">
                                            {u.nume}
                                            {u.esteAdmin && <span className="adminBadge">Admin</span>}
                                            {u.esteDonator && <span className="adminBadgeSecondary">Donator</span>}
                                        </p>
                                        <p className="adminRowSub">
                                            {u.email} · {u.oras}
                                        </p>
                                    </div>
                                </div>
                                <div className="adminRowActions">
                                    <button className="adminSecondaryButton" onClick={() => handleToggleAdmin(u)}>
                                        {u.esteAdmin ? 'Revocă admin' : 'Fă admin'}
                                    </button>
                                    <button
                                        className="adminDeleteButton"
                                        onClick={() => handleDeleteUser(u)}
                                        disabled={u.id === currentUserId}
                                        title={u.id === currentUserId ? 'Nu te poți șterge pe tine' : undefined}
                                    >
                                        Șterge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'centre' && (
                    <CentersAdminTab centre={centers} onChanged={refresh} />
                )}
            </div>
        </div>
    )
}

type CentersAdminTabProps = {
    centre: CentruTransfuzie[]
    onChanged: () => void
}

function CentersAdminTab({ centre, onChanged }: CentersAdminTabProps) {
    const [editId, setEditId] = useState<string | null>(null)
    const [formData, setFormData] = useState<CentruTransfuzie>(centruGol)
    const [adaugaVizibil, setAdaugaVizibil] = useState(false)

    function startEdit(c: CentruTransfuzie) {
        setEditId(c.id)
        setFormData(c)
        setAdaugaVizibil(false)
    }

    function startAdd() {
        setEditId(null)
        setFormData({ ...centruGol, id: crypto.randomUUID() })
        setAdaugaVizibil(true)
    }

    function cancel() {
        setEditId(null)
        setAdaugaVizibil(false)
        setFormData(centruGol)
    }

    function salveaza() {
        if (!formData.nume || !formData.oras || !formData.adresa) return

        if (editId) {
            updateCenter(editId, formData)
        } else {
            addCenter(formData)
        }
        cancel()
        onChanged()
    }

    function sterge(id: string) {
        deleteCenter(id)
        onChanged()
    }

    return (
        <div>
            {!adaugaVizibil && !editId && (
                <button className="adminSecondaryButton adminAddButton" onClick={startAdd}>
                    + Adaugă centru nou
                </button>
            )}

            {(adaugaVizibil || editId) && (
                <div className="adminForm">
                    <div className="adminFormRow">
                        <input
                            placeholder="Nume centru"
                            value={formData.nume}
                            onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                        />
                        <input
                            placeholder="Oraș"
                            value={formData.oras}
                            onChange={(e) => setFormData({ ...formData, oras: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <input
                            placeholder="Adresă"
                            value={formData.adresa}
                            onChange={(e) => setFormData({ ...formData, adresa: e.target.value })}
                        />
                        <input
                            placeholder="Telefon"
                            value={formData.telefon}
                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <input
                            placeholder="Program (ex: Luni–Vineri, 08:00–14:00)"
                            value={formData.program}
                            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <input
                            type="number"
                            step="any"
                            placeholder="Latitudine"
                            value={formData.lat || ''}
                            onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                        />
                        <input
                            type="number"
                            step="any"
                            placeholder="Longitudine"
                            value={formData.lng || ''}
                            onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                        />
                    </div>
                    <div className="adminFormActions">
                        <button className="adminSubmitButton" onClick={salveaza}>
                            Salvează
                        </button>
                        <button className="adminSecondaryButton" onClick={cancel}>
                            Renunță
                        </button>
                    </div>
                </div>
            )}

            <div className="adminList">
                {centre.map((c) => (
                    <div key={c.id} className="adminRow">
                        <div className="adminRowMain">
                            <div className="adminRowInfo">
                                <p className="adminRowTitle">{c.nume}</p>
                                <p className="adminRowSub">
                                    {c.oras} · {c.adresa}
                                </p>
                            </div>
                        </div>
                        <div className="adminRowActions">
                            <button className="adminSecondaryButton" onClick={() => startEdit(c)}>
                                Editează
                            </button>
                            <button className="adminDeleteButton" onClick={() => sterge(c.id)}>
                                Șterge
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
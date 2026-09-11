import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../auth/AuthContext'
import { getUsers, setAdmin, deleteUser } from '../auth/usersStore'
import type { UserRecord } from '../auth/usersStore'
import { getRequests, updateRequestStatus, deleteRequest } from '../requests/requestsStore'
import type { BloodRequest, StatusCerere } from '../requests/types'
import { getCenters, addCenter, updateCenter, deleteCenter } from '../centers/centersStore'
import type { CentruTransfuzie } from '../centers/centers'
import './AdminDashboardPage.css'
import { CustomSelect } from '../../components/ui/CustomSelect'

type Tab = 'statistici' | 'cereri' | 'utilizatori' | 'centre'

const tabInfo: { value: Tab; label: string; icon: string }[] = [
    { value: 'statistici', label: 'Statistici', icon: '📊' },
    { value: 'cereri', label: 'Cereri', icon: '🩸' },
    { value: 'utilizatori', label: 'Utilizatori', icon: '👥' },
    { value: 'centre', label: 'Centre', icon: '📍' },
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

function initiale(nume: string) {
    return nume
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

export function AdminDashboardPage() {
    const { user } = useAuth()
    const [tab, setTab] = useState<Tab>('statistici')
    const [versiune, setVersiune] = useState(0)
    const [cautareCereri, setCautareCereri] = useState('')
    const [cautareUseri, setCautareUseri] = useState('')
    const [cautareCentre, setCautareCentre] = useState('')

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

    const requestsFiltrate = requests.filter((r) => {
        const q = cautareCereri.toLowerCase()
        return (
            r.solicitantNume.toLowerCase().includes(q) ||
            r.oras.toLowerCase().includes(q) ||
            r.grupaNecesara.toLowerCase().includes(q)
        )
    })

    const usersFiltrati = users.filter((u) => {
        const q = cautareUseri.toLowerCase()
        return u.nume.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.oras.toLowerCase().includes(q)
    })

    const centreFiltrate = centers.filter((c) => {
        const q = cautareCentre.toLowerCase()
        return c.nume.toLowerCase().includes(q) || c.oras.toLowerCase().includes(q)
    })

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
                <div className="adminLayout">
                    <aside className="adminSidebar">
                        <nav className="adminSidebarNav">
                            {tabInfo.map((item) => (
                                <button
                                    key={item.value}
                                    className={`adminSidebarItem ${tab === item.value ? 'adminSidebarItemActive' : ''}`}
                                    onClick={() => setTab(item.value)}
                                >
                                    <span className="adminSidebarIcon">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <div className="adminMain">

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
                            <div className="adminTableCard">
                                <div className="adminTableToolbar">
                                    <input
                                        className="adminSearchInput"
                                        placeholder="Caută după nume, oraș sau grupă..."
                                        value={cautareCereri}
                                        onChange={(e) => setCautareCereri(e.target.value)}
                                    />
                                </div>

                                {requestsFiltrate.length === 0 ? (
                                    <p className="adminEmptyState">Nu există cereri care să corespundă căutării.</p>
                                ) : (
                                    <div className="adminTableWrap">
                                        <table className="adminTable">
                                            <thead>
                                            <tr>
                                                <th>Solicitant</th>
                                                <th>Grupă</th>
                                                <th>Oraș</th>
                                                <th>Urgență</th>
                                                <th>Data</th>
                                                <th>Status</th>
                                                <th>Acțiuni</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {requestsFiltrate.map((r) => (
                                                <RequestRow
                                                    key={r.id}
                                                    r={r}
                                                    onStatusChange={handleStatusChange}
                                                    onDelete={handleDeleteRequest}
                                                />
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'utilizatori' && (
                            <div className="adminTableCard">
                                <div className="adminTableToolbar">
                                    <input
                                        className="adminSearchInput"
                                        placeholder="Caută după nume, email sau oraș..."
                                        value={cautareUseri}
                                        onChange={(e) => setCautareUseri(e.target.value)}
                                    />
                                </div>

                                <div className="adminTableWrap">
                                    <table className="adminTable">
                                        <thead>
                                        <tr>
                                            <th>Utilizator</th>
                                            <th>Email</th>
                                            <th>Oraș</th>
                                            <th>Status</th>
                                            <th>Acțiuni</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {usersFiltrati.map((u) => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="adminUserCell">
                                                        <span className="adminAvatar">{initiale(u.nume)}</span>
                                                        {u.nume}
                                                    </div>
                                                </td>
                                                <td className="adminMuted">{u.email}</td>
                                                <td className="adminMuted">{u.oras}</td>
                                                <td>
                                                    <div className="adminBadgeGroup">
                                                        {u.esteAdmin && <span className="adminBadge">Admin</span>}
                                                        {u.esteDonator && <span className="adminBadgeSecondary">Donator</span>}
                                                        {!u.esteAdmin && !u.esteDonator && (
                                                            <span className="adminBadgeNeutral">Utilizator</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="adminActionsCell">
                                                        <button
                                                            className="adminEditButton"
                                                            onClick={() => handleToggleAdmin(u)}
                                                        >
                                                            {u.esteAdmin ? 'Revocă admin' : 'Fă admin'}
                                                        </button>
                                                        <button
                                                            className="adminDeleteButton"
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={u.id === currentUserId}
                                                            title={
                                                                u.id === currentUserId
                                                                    ? 'Nu te poți șterge pe tine'
                                                                    : undefined
                                                            }
                                                        >
                                                            Șterge
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {tab === 'centre' && (
                            <CentersAdminTab
                                centre={centreFiltrate}
                                cautare={cautareCentre}
                                onCautareChange={setCautareCentre}
                                onChanged={refresh}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

type RequestRowProps = {
    r: BloodRequest
    onStatusChange: (id: string, status: StatusCerere) => void
    onDelete: (id: string) => void
}

function RequestRow({ r, onStatusChange, onDelete }: RequestRowProps) {
    return (
        <tr>
            <td>
                <div className="adminUserCell">
                    <span className={`adminAvatar adminAvatar--${r.urgenta}`}>{r.grupaNecesara}</span>
                    {r.solicitantNume}
                </div>
            </td>
            <td className="adminMuted">{r.grupaNecesara}</td>
            <td className="adminMuted">{r.oras}</td>
            <td className="adminMuted" style={{ textTransform: 'capitalize' }}>
                {r.urgenta}
            </td>
            <td className="adminMuted">{r.dataCreare}</td>
            <td>
                <div className="adminStatusSelectWrap">
                    <CustomSelect
                        options={statusOptions}
                        value={r.status}
                        onChange={(v) => onStatusChange(r.id, v as StatusCerere)}
                        labels={statusLabel}
                    />
                </div>
            </td>
            <td>
                <div className="adminActionsCell">
                    <button className="adminDeleteButton" onClick={() => onDelete(r.id)}>
                        Șterge
                    </button>
                </div>
            </td>
        </tr>
    )
}

type CentersAdminTabProps = {
    centre: CentruTransfuzie[]
    cautare: string
    onCautareChange: (v: string) => void
    onChanged: () => void
}

function CentersAdminTab({ centre, cautare, onCautareChange, onChanged }: CentersAdminTabProps) {
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
        <div className="adminTableCard">
            <div className="adminTableToolbar">
                <input
                    className="adminSearchInput"
                    placeholder="Caută după nume sau oraș..."
                    value={cautare}
                    onChange={(e) => onCautareChange(e.target.value)}
                />
                {!adaugaVizibil && !editId && (
                    <button className="adminEditButton" onClick={startAdd}>
                        + Adaugă centru
                    </button>
                )}
            </div>

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

            <div className="adminTableWrap">
                <table className="adminTable">
                    <thead>
                    <tr>
                        <th>Centru</th>
                        <th>Oraș</th>
                        <th>Adresă</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {centre.map((c) => (
                        <tr key={c.id}>
                            <td>
                                <div className="adminUserCell">
                                    <span className="adminAvatar">{initiale(c.nume)}</span>
                                    {c.nume}
                                </div>
                            </td>
                            <td className="adminMuted">{c.oras}</td>
                            <td className="adminMuted">{c.adresa}</td>
                            <td>
                                <div className="adminActionsCell">
                                    <button className="adminEditButton" onClick={() => startEdit(c)}>
                                        Editează
                                    </button>
                                    <button className="adminDeleteButton" onClick={() => sterge(c.id)}>
                                        Șterge
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
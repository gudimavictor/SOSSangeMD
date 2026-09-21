import { useEffect, useEffectEvent, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../auth/AuthContext'
import { getUsers, updateUser, deleteUser } from '../auth/usersStore'
import type { UserRecord } from '../auth/usersStore'
import type { BloodRequest, StatusCerere, NivelUrgenta } from '../requests/types'
import type { GrupaSanguina } from '../auth/AuthContext'
import { getCenters, addCenter, updateCenter, deleteCenter } from '../centers/centersStore'
import type { CentruTransfuzie } from '../centers/centers'
import type { SupportMessage } from '../support/types'
import { useApi } from '../../api/use-api'
import { useAsync } from '../../api/useAsync'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { IconChart, IconDrop, IconUsers, IconLocation, IconMail } from '../../components/ui/Icons'
import './AdminDashboardPage.css'

type Tab = 'statistici' | 'cereri' | 'utilizatori' | 'centre' | 'mesaje'

const tabInfo: { value: Tab; label: string; icon: typeof IconChart }[] = [
    { value: 'statistici', label: 'Statistici', icon: IconChart },
    { value: 'cereri', label: 'Cereri', icon: IconDrop },
    { value: 'utilizatori', label: 'Utilizatori', icon: IconUsers },
    { value: 'centre', label: 'Centre', icon: IconLocation },
    { value: 'mesaje', label: 'Mesaje', icon: IconMail },
]

const statusOptions: StatusCerere[] = ['activa', 'rezolvata', 'expirata']

const statusLabel: Record<StatusCerere, string> = {
    activa: 'Activă',
    rezolvata: 'Rezolvată',
    expirata: 'Expirată',
}

const grupeSanguine: GrupaSanguina[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

const urgentaOptions: NivelUrgenta[] = ['critica', 'urgenta', 'programata']

const urgentaLabel: Record<NivelUrgenta, string> = {
    critica: 'Critică',
    urgenta: 'Urgentă',
    programata: 'Programată',
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
    const [cautareMesaje, setCautareMesaje] = useState('')

    const refresh = () => setVersiune((v) => v + 1)

    const api = useApi()
    const [eroareMesaje, setEroareMesaje] = useState('')
    const {
        data: mesajeApi,
        error: eroareIncarcareMesaje,
        loading: seIncarcaMesajele,
        reload: reincarcaMesajele,
    } = useAsync(() => api.support.listSupportMessages(), [user?.id ?? null], !!user?.esteAdmin)

    const [eroareCereri, setEroareCereri] = useState('')
    const {
        data: cereriApi,
        error: eroareIncarcareCereri,
        loading: seIncarcaCererile,
        reload: reincarcaCererile,
    } = useAsync(() => api.requests.listRequests(), [user?.id ?? null], !!user?.esteAdmin)

    const reincarcaPeriodic = useEffectEvent(() => reincarcaMesajele())
    const esteAdmin = !!user?.esteAdmin
    useEffect(() => {
        if (!esteAdmin) return
        const interval = window.setInterval(reincarcaPeriodic, 30_000)
        return () => window.clearInterval(interval)
    }, [esteAdmin])

    if (!user) {
        return (
            <div className="adminPage">
                <div className="adminHero">
                    <span className="adminHeroIcon">
                        <IconDrop />
                    </span>
                    <div>
                        <h1 className="adminHeroTitle">Admin Dashboard</h1>
                        <p className="adminHeroSubtitle">Zonă restricționată — necesită autentificare.</p>
                    </div>
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
                    <span className="adminHeroIcon">
                        <IconDrop />
                    </span>
                    <div>
                        <h1 className="adminHeroTitle">Admin Dashboard</h1>
                        <p className="adminHeroSubtitle">Zonă restricționată.</p>
                    </div>
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
    const requests = cereriApi ?? []
    const centers = getCenters()
    const mesaje = mesajeApi ?? []
    const currentUserId = user.id

    const totalDonatori = users.filter((u) => u.esteDonator).length
    const cereriActive = requests.filter((r) => r.status === 'activa').length
    const cereriRezolvate = requests.filter((r) => r.status === 'rezolvata').length
    const mesajeNecitite = mesaje.filter((m) => !m.raspuns).length

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

    const mesajeFiltrate = mesaje
        .filter((m) => {
            const q = cautareMesaje.toLowerCase()
            return m.nume.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.mesaj.toLowerCase().includes(q)
        })
        .sort((a, b) => b.data.localeCompare(a.data))

    async function executaPeCereri(actiune: () => Promise<unknown>) {
        setEroareCereri('')
        try {
            await actiune()
            reincarcaCererile()
        } catch (e) {
            setEroareCereri(e instanceof Error ? e.message : 'Acțiunea a eșuat.')
        }
    }

    function handleStatusChange(id: string, status: StatusCerere) {
        const cerere = requests.find((r) => r.id === id)
        if (!cerere) return
        return executaPeCereri(() => api.requests.updateRequest({ ...cerere, status }))
    }

    function handleEditRequest(id: string, updates: Partial<BloodRequest>) {
        const cerere = requests.find((r) => r.id === id)
        if (!cerere) return
        return executaPeCereri(() => api.requests.updateRequest({ ...cerere, ...updates }))
    }

    function handleDeleteRequest(id: string) {
        return executaPeCereri(() => api.requests.deleteRequest(id))
    }

    function handleEditUser(id: string, updates: Partial<UserRecord>) {
        updateUser(id, updates)
        refresh()
    }

    function handleDeleteUser(u: UserRecord) {
        if (u.id === currentUserId) return
        deleteUser(u.id)
        refresh()
    }

    async function executaPeMesaje(actiune: () => Promise<unknown>) {
        setEroareMesaje('')
        try {
            await actiune()
            reincarcaMesajele()
        } catch (e) {
            setEroareMesaje(e instanceof Error ? e.message : 'Acțiunea a eșuat.')
        }
    }

    function handleReplyMessage(mesaj: SupportMessage, raspuns: string) {
        return executaPeMesaje(() => api.support.replySupportMessage(mesaj.id, raspuns))
    }

    function handleDeleteMessage(id: string) {
        return executaPeMesaje(() => api.support.deleteSupportMessage(id))
    }

    return (
        <div className="adminPage">
            <div className="adminTopbar">
                <div className="adminTopbarBrand">
                    <span className="adminTopbarIcon">
                        <IconDrop />
                    </span>
                    <div>
                        <span className="adminTopbarTitle">Panou Administrator</span>
                        <span className="adminTopbarSubtitle">Gestionează platforma</span>
                    </div>
                </div>
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
                                    <span className="adminSidebarIcon">
                                        <item.icon />
                                    </span>
                                    {item.label}
                                    {item.value === 'mesaje' && mesajeNecitite > 0 && (
                                        <span className="adminSidebarBadge">
                                            {mesajeNecitite > 9 ? '9+' : mesajeNecitite}
                                        </span>
                                    )}
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
                                <div className="adminStatCard">
                                    <span className="adminStatNumber">{mesajeNecitite}</span>
                                    <span className="adminStatLabel">Mesaje necitite</span>
                                </div>
                            </div>
                        )}

                        {tab === 'cereri' && (
                            <>
                                {(eroareCereri || eroareIncarcareCereri) && (
                                    <p className="apiErrorMsg">{eroareCereri || eroareIncarcareCereri}</p>
                                )}
                                <RequestsAdminTab
                                    cereri={requestsFiltrate}
                                    incarcare={seIncarcaCererile}
                                    cautare={cautareCereri}
                                    onCautareChange={setCautareCereri}
                                    onStatusChange={handleStatusChange}
                                    onEdit={handleEditRequest}
                                    onDelete={handleDeleteRequest}
                                />
                            </>
                        )}

                        {tab === 'utilizatori' && (
                            <UsersAdminTab
                                useri={usersFiltrati}
                                cautare={cautareUseri}
                                onCautareChange={setCautareUseri}
                                currentUserId={currentUserId}
                                onEdit={handleEditUser}
                                onDelete={handleDeleteUser}
                            />
                        )}

                        {tab === 'centre' && (
                            <CentersAdminTab
                                centre={centreFiltrate}
                                cautare={cautareCentre}
                                onCautareChange={setCautareCentre}
                                onChanged={refresh}
                            />
                        )}

                        {tab === 'mesaje' && (
                            <>
                                {(eroareMesaje || eroareIncarcareMesaje) && (
                                    <p className="apiErrorMsg">{eroareMesaje || eroareIncarcareMesaje}</p>
                                )}
                                <MessagesAdminTab
                                    mesaje={mesajeFiltrate}
                                    incarcare={seIncarcaMesajele}
                                    cautare={cautareMesaje}
                                    onCautareChange={setCautareMesaje}
                                    onReply={handleReplyMessage}
                                    onDelete={handleDeleteMessage}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

type RequestsAdminTabProps = {
    cereri: BloodRequest[]
    incarcare: boolean
    cautare: string
    onCautareChange: (v: string) => void
    onStatusChange: (id: string, status: StatusCerere) => void
    onEdit: (id: string, updates: Partial<BloodRequest>) => void
    onDelete: (id: string) => void
}

type CerereEditForm = {
    grupaNecesara: GrupaSanguina
    oras: string
    urgenta: NivelUrgenta
    descriere: string
}

function RequestsAdminTab({
    cereri,
    incarcare,
    cautare,
    onCautareChange,
    onStatusChange,
    onEdit,
    onDelete,
}: RequestsAdminTabProps) {
    const [editId, setEditId] = useState<string | null>(null)
    const [formData, setFormData] = useState<CerereEditForm>({
        grupaNecesara: 'O-',
        oras: '',
        urgenta: 'programata',
        descriere: '',
    })

    function startEdit(r: BloodRequest) {
        setEditId(r.id)
        setFormData({
            grupaNecesara: r.grupaNecesara,
            oras: r.oras,
            urgenta: r.urgenta,
            descriere: r.descriere,
        })
    }

    function cancel() {
        setEditId(null)
    }

    function salveaza() {
        if (!editId || !formData.oras || !formData.descriere) return
        onEdit(editId, formData)
        setEditId(null)
    }

    return (
        <div className="adminTableCard">
            <div className="adminTableToolbar">
                <input
                    className="adminSearchInput"
                    placeholder="Caută după nume, oraș sau grupă..."
                    value={cautare}
                    onChange={(e) => onCautareChange(e.target.value)}
                />
            </div>

            {editId && (
                <div className="adminForm">
                    <div className="adminFormRow">
                        <CustomSelect
                            options={grupeSanguine}
                            value={formData.grupaNecesara}
                            onChange={(v) => setFormData({ ...formData, grupaNecesara: v as GrupaSanguina })}
                        />
                        <input
                            placeholder="Oraș"
                            value={formData.oras}
                            onChange={(e) => setFormData({ ...formData, oras: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <CustomSelect
                            options={urgentaOptions}
                            value={formData.urgenta}
                            onChange={(v) => setFormData({ ...formData, urgenta: v as NivelUrgenta })}
                            labels={urgentaLabel}
                        />
                    </div>
                    <div className="adminFormRow">
                        <input
                            placeholder="Descriere"
                            value={formData.descriere}
                            onChange={(e) => setFormData({ ...formData, descriere: e.target.value })}
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

            {incarcare ? (
                <p className="adminEmptyState">Se încarcă cererile...</p>
            ) : cereri.length === 0 ? (
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
                        {cereri.map((r) => (
                            <tr key={r.id}>
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
                                <td className="adminMuted">{r.dataCreare.slice(0, 10)}</td>
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
                                        <button className="adminEditButton" onClick={() => startEdit(r)}>
                                            Editează
                                        </button>
                                        <button className="adminDeleteButton" onClick={() => onDelete(r.id)}>
                                            Șterge
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

type UsersAdminTabProps = {
    useri: UserRecord[]
    cautare: string
    onCautareChange: (v: string) => void
    currentUserId: string
    onEdit: (id: string, updates: Partial<UserRecord>) => void
    onDelete: (u: UserRecord) => void
}

type UserEditForm = {
    nume: string
    email: string
    telefon: string
    oras: string
    varsta: string
    esteDonator: boolean
    esteAdmin: boolean
}

function UsersAdminTab({ useri, cautare, onCautareChange, currentUserId, onEdit, onDelete }: UsersAdminTabProps) {
    const [editId, setEditId] = useState<string | null>(null)
    const [formData, setFormData] = useState<UserEditForm>({
        nume: '',
        email: '',
        telefon: '',
        oras: '',
        varsta: '',
        esteDonator: false,
        esteAdmin: false,
    })

    function startEdit(u: UserRecord) {
        setEditId(u.id)
        setFormData({
            nume: u.nume,
            email: u.email,
            telefon: u.telefon,
            oras: u.oras,
            varsta: u.varsta === null ? '' : String(u.varsta),
            esteDonator: u.esteDonator,
            esteAdmin: u.esteAdmin,
        })
    }

    function cancel() {
        setEditId(null)
    }

    function salveaza() {
        if (!editId || !formData.nume || !formData.email || !formData.oras) return
        onEdit(editId, {
            nume: formData.nume,
            email: formData.email,
            telefon: formData.telefon,
            oras: formData.oras,
            varsta: formData.varsta ? Number(formData.varsta) : null,
            esteDonator: formData.esteDonator,
            esteAdmin: formData.esteAdmin,
        })
        setEditId(null)
    }

    return (
        <div className="adminTableCard">
            <div className="adminTableToolbar">
                <input
                    className="adminSearchInput"
                    placeholder="Caută după nume, email sau oraș..."
                    value={cautare}
                    onChange={(e) => onCautareChange(e.target.value)}
                />
            </div>

            {editId && (
                <div className="adminForm">
                    <div className="adminFormRow">
                        <input
                            placeholder="Nume complet"
                            value={formData.nume}
                            onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <input
                            placeholder="Telefon"
                            value={formData.telefon}
                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                        />
                        <input
                            placeholder="Oraș"
                            value={formData.oras}
                            onChange={(e) => setFormData({ ...formData, oras: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <input
                            type="number"
                            min={18}
                            max={100}
                            placeholder="Vârstă"
                            value={formData.varsta}
                            onChange={(e) => setFormData({ ...formData, varsta: e.target.value })}
                        />
                    </div>
                    <div className="adminFormRow">
                        <label className="confirmCheckboxLabel">
                            <input
                                type="checkbox"
                                checked={formData.esteDonator}
                                onChange={(e) => setFormData({ ...formData, esteDonator: e.target.checked })}
                            />
                            <span>Donator</span>
                        </label>
                        <label className="confirmCheckboxLabel">
                            <input
                                type="checkbox"
                                checked={formData.esteAdmin}
                                onChange={(e) => setFormData({ ...formData, esteAdmin: e.target.checked })}
                                disabled={editId === currentUserId}
                            />
                            <span>Admin</span>
                        </label>
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
                        <th>Utilizator</th>
                        <th>Email</th>
                        <th>Oraș</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                    </tr>
                    </thead>
                    <tbody>
                    {useri.map((u) => (
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
                                    <button className="adminEditButton" onClick={() => startEdit(u)}>
                                        Editează
                                    </button>
                                    <button
                                        className="adminDeleteButton"
                                        onClick={() => onDelete(u)}
                                        disabled={u.id === currentUserId}
                                        title={u.id === currentUserId ? 'Nu te poți șterge pe tine' : undefined}
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

type MessagesAdminTabProps = {
    mesaje: SupportMessage[]
    incarcare: boolean
    cautare: string
    onCautareChange: (v: string) => void
    onReply: (mesaj: SupportMessage, raspuns: string) => void
    onDelete: (id: string) => void
}

function formateazaDataMesaj(data: string) {
    return new Date(data).toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function MessagesAdminTab({ mesaje, incarcare, cautare, onCautareChange, onReply, onDelete }: MessagesAdminTabProps) {
    const [replyId, setReplyId] = useState<string | null>(null)
    const [raspunsText, setRaspunsText] = useState('')

    function startReply(m: SupportMessage) {
        setReplyId(m.id)
        setRaspunsText(m.raspuns ?? '')
    }

    function cancel() {
        setReplyId(null)
        setRaspunsText('')
    }

    function trimiteRaspuns(m: SupportMessage) {
        if (!raspunsText.trim()) return
        onReply(m, raspunsText.trim())
        setReplyId(null)
        setRaspunsText('')
    }

    return (
        <div className="adminTableCard">
            <div className="adminTableToolbar">
                <input
                    className="adminSearchInput"
                    placeholder="Caută după nume, email sau mesaj..."
                    value={cautare}
                    onChange={(e) => onCautareChange(e.target.value)}
                />
            </div>

            {incarcare ? (
                <p className="adminEmptyState">Se încarcă mesajele...</p>
            ) : mesaje.length === 0 ? (
                <p className="adminEmptyState">Nu există mesaje care să corespundă căutării.</p>
            ) : (
                <div className="adminMessagesList">
                    {mesaje.map((m) => (
                        <div key={m.id} className={`adminMessageCard ${!m.raspuns ? 'adminMessageCardUnread' : ''}`}>
                            <div className="adminMessageTop">
                                <div className="adminUserCell">
                                    <span className="adminAvatar">{initiale(m.nume)}</span>
                                    <div>
                                        <p className="adminMessageName">{m.nume}</p>
                                        <p className="adminMessageEmail">{m.email}</p>
                                    </div>
                                </div>
                                <div className="adminMessageMeta">
                                    {!m.raspuns && <span className="adminBadge">Nou</span>}
                                    <span className="adminMessageDate">{formateazaDataMesaj(m.data)}</span>
                                </div>
                            </div>
                            <p className="adminMessageText">{m.mesaj}</p>

                            {m.raspuns && replyId !== m.id && (
                                <div className="adminMessageReply">
                                    <p className="adminMessageReplyLabel">Răspunsul tău</p>
                                    <p className="adminMessageReplyText">{m.raspuns}</p>
                                </div>
                            )}

                            {replyId === m.id ? (
                                <div className="adminMessageReplyForm">
                                    <textarea
                                        rows={3}
                                        value={raspunsText}
                                        onChange={(e) => setRaspunsText(e.target.value)}
                                        placeholder="Scrie un răspuns..."
                                    />
                                    <div className="adminActionsCell">
                                        <button className="adminSubmitButton" onClick={() => trimiteRaspuns(m)}>
                                            Trimite răspuns
                                        </button>
                                        <button className="adminSecondaryButton" onClick={cancel}>
                                            Renunță
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="adminActionsCell">
                                    <button className="adminEditButton" onClick={() => startReply(m)}>
                                        {m.raspuns ? 'Editează răspunsul' : 'Răspunde'}
                                    </button>
                                    <button className="adminDeleteButton" onClick={() => onDelete(m.id)}>
                                        Șterge
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
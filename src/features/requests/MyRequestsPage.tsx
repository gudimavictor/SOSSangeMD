import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { getRequestsByUser, updateRequestStatus, updateRequest, deleteRequest } from './requestsStore'
import { grupeleSanguine } from './compatibilitate'
import { CustomSelect } from '../../components/ui/CustomSelect'
import type { BloodRequest, StatusCerere, NivelUrgenta } from './types'
import type { GrupaSanguina } from '../auth/AuthContext'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import './MyRequestsPage.css'

type Tab = 'active' | 'rezolvate' | 'toate'
type SortBy = 'data' | 'urgenta'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

const tabInfo: { value: Tab; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'rezolvate', label: 'Rezolvate' },
    { value: 'toate', label: 'Toate' },
]

const urgencyOptions: { value: NivelUrgenta; label: string }[] = [
    { value: 'critica', label: 'Critică' },
    { value: 'urgenta', label: 'Urgentă' },
    { value: 'programata', label: 'Programată' },
]

const urgentaOrdine: Record<NivelUrgenta, number> = { critica: 0, urgenta: 1, programata: 2 }

const statusLabel: Record<StatusCerere, string> = {
    activa: 'Activă',
    rezolvata: 'Rezolvată',
    expirata: 'Expirată',
}

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

function zileDeLaCreare(dataCreare: string) {
    const creat = new Date(dataCreare)
    const azi = new Date()
    const zile = Math.floor((azi.getTime() - creat.getTime()) / (1000 * 60 * 60 * 24))
    if (zile <= 0) return 'astăzi'
    if (zile === 1) return 'acum 1 zi'
    return `acum ${zile} zile`
}

export function MyRequestsPage() {
    const { user } = useAuth()
    const [tab, setTab] = useState<Tab>('active')
    const [sortBy, setSortBy] = useState<SortBy>('data')
    const [, setVersiune] = useState(0)
    const [editId, setEditId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ grupa: string; oras: string; urgenta: NivelUrgenta; descriere: string }>({
        grupa: '',
        oras: '',
        urgenta: 'urgenta',
        descriere: '',
    })

    const refresh = () => setVersiune((v) => v + 1)

    if (!user) {
        return (
            <div className="myReqPage">
                <div className="myReqPageHeader">
                    <span className="myReqEyebrow">Panou personal</span>
                    <h1 className="myReqPageTitle">Cererile mele</h1>
                    <p className="myReqPageSubtitle">Urmărește statusul cererilor tale de sânge, într-un singur loc.</p>
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

    let listaAfisata: BloodRequest[] =
        tab === 'active' ? active : tab === 'rezolvate' ? rezolvate : toateCererile

    listaAfisata =
        sortBy === 'urgenta'
            ? [...listaAfisata].sort((a, b) => urgentaOrdine[a.urgenta] - urgentaOrdine[b.urgenta])
            : listaAfisata

    function marcheazaRezolvata(id: string) {
        updateRequestStatus(id, 'rezolvata')
        refresh()
    }

    function stergeCererea(id: string) {
        if (!window.confirm('Ștergi definitiv această cerere? Acțiunea nu poate fi anulată.')) return
        deleteRequest(id)
        refresh()
    }

    function incepeEditarea(r: BloodRequest) {
        setEditId(r.id)
        setEditForm({ grupa: r.grupaNecesara, oras: r.oras, urgenta: r.urgenta, descriere: r.descriere })
    }

    function anuleazaEditarea() {
        setEditId(null)
    }

    function salveazaEditarea(id: string) {
        if (!editForm.grupa || !editForm.oras) return
        updateRequest(id, {
            grupaNecesara: editForm.grupa as GrupaSanguina,
            oras: editForm.oras,
            urgenta: editForm.urgenta,
            descriere: editForm.descriere,
        })
        setEditId(null)
        refresh()
    }

    return (
        <div className="myReqPage">
            <div className="myReqPageHeader">
                <span className="myReqEyebrow">Panou personal</span>
                <h1 className="myReqPageTitle">Cererile mele</h1>
                <p className="myReqPageSubtitle">Urmărește statusul cererilor tale de sânge, într-un singur loc.</p>
            </div>

            <div className="myReqBody">
                <motion.div
                    className="myReqStatsRow"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div className="myReqStatItem" variants={fadeUpItem}>
                        <span className="myReqStatNumber">
                            <AnimatedNumber value={toateCererile.length} />
                        </span>
                        <span className="myReqStatLabel">Total cereri</span>
                    </motion.div>
                    <motion.div className="myReqStatItem" variants={fadeUpItem}>
                        <span className="myReqStatNumber">
                            <AnimatedNumber value={active.length} />
                        </span>
                        <span className="myReqStatLabel">Active</span>
                    </motion.div>
                    <motion.div className="myReqStatItem" variants={fadeUpItem}>
                        <span className="myReqStatNumber">
                            <AnimatedNumber value={rezolvate.length} />
                        </span>
                        <span className="myReqStatLabel">Rezolvate</span>
                    </motion.div>
                </motion.div>

                <div className="myReqControls">
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

                    <div className="myReqSort">
                        <label>Sortează:</label>
                        <div className="myReqSortSelect">
                            <CustomSelect
                                options={['data', 'urgenta']}
                                value={sortBy}
                                onChange={(v) => setSortBy(v as SortBy)}
                                labels={{ data: 'Data creării', urgenta: 'Nivel de urgență' }}
                            />
                        </div>
                    </div>
                </div>

                {listaAfisata.length === 0 ? (
                    <div className="myReqEmptyState">
                        <span className="myReqEmptyIcon">🩸</span>
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
                    <motion.div
                        className="myReqList"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                    >
                        <AnimatePresence>
                            {listaAfisata.map((r) => (
                                <motion.div
                                    key={r.id}
                                    layout
                                    variants={fadeUpItem}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    className={`myReqCard myReqCard--${r.urgenta}`}
                                >
                                    {editId === r.id ? (
                                        <div className="myReqEditForm">
                                            <div className="myReqEditRow">
                                                <CustomSelect
                                                    options={grupeleSanguine}
                                                    value={editForm.grupa}
                                                    onChange={(v) => setEditForm({ ...editForm, grupa: v })}
                                                    placeholder="Grupa"
                                                />
                                                <CustomSelect
                                                    options={orase}
                                                    value={editForm.oras}
                                                    onChange={(v) => setEditForm({ ...editForm, oras: v })}
                                                    placeholder="Oraș"
                                                />
                                            </div>
                                            <div className="myReqEditUrgency">
                                                {urgencyOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        className={`myReqEditUrgencyBtn ${editForm.urgenta === opt.value ? 'myReqEditUrgencyBtnActive' : ''}`}
                                                        onClick={() => setEditForm({ ...editForm, urgenta: opt.value })}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                rows={2}
                                                value={editForm.descriere}
                                                onChange={(e) => setEditForm({ ...editForm, descriere: e.target.value })}
                                                placeholder="Descriere"
                                            />
                                            <div className="myReqEditActions">
                                                <button className="myReqSaveButton" onClick={() => salveazaEditarea(r.id)}>
                                                    Salvează
                                                </button>
                                                <button className="myReqCancelButton" onClick={anuleazaEditarea}>
                                                    Renunță
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="myReqCardTop">
                                                <span className="myReqGroup">{r.grupaNecesara}</span>
                                                <div className="myReqBadges">
                                                    <span className={`myReqUrgency myReqUrgency--${r.urgenta}`}>
                                                        {r.urgenta}
                                                    </span>
                                                    <span className={`myReqStatus myReqStatus--${r.status}`}>
                                                        {statusLabel[r.status]}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="myReqDesc">{r.descriere || 'Fără descriere.'}</p>

                                            <div className="myReqCardFooter">
                                                <span className="myReqCity">📍 {r.oras}</span>
                                                <span className="myReqDate">{zileDeLaCreare(r.dataCreare)}</span>
                                            </div>

                                            <div className="myReqActions">
                                                {r.status === 'activa' && (
                                                    <button
                                                        className="myReqResolveButton"
                                                        onClick={() => marcheazaRezolvata(r.id)}
                                                    >
                                                        Marchează rezolvată
                                                    </button>
                                                )}
                                                <button className="myReqEditButton" onClick={() => incepeEditarea(r)}>
                                                    Editează
                                                </button>
                                                <button
                                                    className="myReqDeleteButton"
                                                    onClick={() => stergeCererea(r.id)}
                                                >
                                                    Șterge
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
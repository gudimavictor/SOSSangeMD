import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useAuth } from '../auth/AuthContext'
import { updateUser as updateUserRecord, hashParola } from '../auth/usersStore'
import { IconUser, IconLock, IconDrop } from '../../components/ui/Icons'
import { PageHeader } from '../../components/ui/PageHeader'
import './ProfilePage.css'

const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
} as const

const fadeUpItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const

export function ProfilePage() {
    const { user, updateUser } = useAuth()

    const [editMode, setEditMode] = useState(false)
    const [parolaMode, setParolaMode] = useState(false)
    const [eroare, setEroare] = useState('')
    const [mesaj, setMesaj] = useState('')

    const [nume, setNume] = useState(user?.nume ?? '')
    const [telefon, setTelefon] = useState(user?.telefon ?? '')
    const [oras, setOras] = useState(user?.oras ?? '')
    const [varsta, setVarsta] = useState(user?.varsta ? String(user.varsta) : '')

    const [parolaNoua, setParolaNoua] = useState('')
    const [confirmaParola, setConfirmaParola] = useState('')

    if (!user) {
        return (
            <div className="profilePage">
                <PageHeader
                    className="profilePageHeader"
                    icon={<IconUser />}
                    eyebrow="Profilul meu"
                    title="Profilul meu"
                    subtitle="Trebuie să fii autentificat ca să-ți vezi profilul."
                />
                <div className="profileBody">
                    <div className="profileLoginPrompt">
                        <p>Trebuie să fii autentificat ca să accesezi această pagină.</p>
                        <Link to="/login" search={{ redirect: '/profil' }} className="profileCta">
                            Autentifică-te
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        setEroare('')
        setMesaj('')

        if (!nume || !oras) {
            setEroare('Numele și orașul sunt obligatorii.')
            return
        }

        const varstaNumar = varsta ? Number(varsta) : null
        if (varstaNumar !== null && (!Number.isInteger(varstaNumar) || varstaNumar < 18 || varstaNumar > 100)) {
            setEroare('Introdu o vârstă validă.')
            return
        }

        const updates = { nume, telefon, oras, varsta: varstaNumar }
        updateUser(updates)
        updateUserRecord(user.id, updates)
        setEditMode(false)
        setMesaj('Datele au fost salvate.')
    }

    async function handleSchimbaParola(event: FormEvent) {
        event.preventDefault()
        setEroare('')
        setMesaj('')

        if (parolaNoua.length < 6) {
            setEroare('Parola trebuie să aibă minim 6 caractere.')
            return
        }

        if (parolaNoua !== confirmaParola) {
            setEroare('Parolele nu coincid.')
            return
        }

        const hash = await hashParola(parolaNoua)
        updateUserRecord(user.id, { parola: hash })
        setParolaNoua('')
        setConfirmaParola('')
        setParolaMode(false)
        setMesaj('Parola a fost schimbată.')
    }

    return (
        <div className="profilePage">
            <PageHeader
                className="profilePageHeader"
                icon={<IconUser />}
                eyebrow="Profilul meu"
                title={user.nume}
                subtitle="Gestionează datele tale de cont și parola."
            />

            <div className="profileBody">
                {mesaj && <p className="profileSuccessMsg">{mesaj}</p>}
                {eroare && <p className="profileErrorMsg">{eroare}</p>}

                {!editMode ? (
                    <motion.div className="profileCard" variants={staggerContainer} initial="hidden" animate="show">
                        <motion.div className="profileRow" variants={fadeUpItem}>
                            <div className="profileItem">
                                <span className="profileLabel">Nume complet</span>
                                <span className="profileValue">{user.nume}</span>
                            </div>
                            <div className="profileItem">
                                <span className="profileLabel">Email</span>
                                <span className="profileValue">{user.email}</span>
                            </div>
                            <div className="profileItem">
                                <span className="profileLabel">Telefon</span>
                                <span className="profileValue">{user.telefon || '—'}</span>
                            </div>
                        </motion.div>
                        <motion.div className="profileRow" variants={fadeUpItem}>
                            <div className="profileItem">
                                <span className="profileLabel">Oraș</span>
                                <span className="profileValue">{user.oras}</span>
                            </div>
                            <div className="profileItem">
                                <span className="profileLabel">Vârstă</span>
                                <span className="profileValue">{user.varsta ?? '—'}</span>
                            </div>
                            <div className="profileItem">
                                <span className="profileLabel">Status</span>
                                <span className="profileValue">
                                    {user.esteDonator ? (
                                        <span className="profileDonorBadge iconText">
                                            <IconDrop /> Donator {user.grupaSanguina}
                                        </span>
                                    ) : (
                                        'Utilizator'
                                    )}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div className="profileActions" variants={fadeUpItem}>
                            <button className="profileSecondaryButton" onClick={() => setEditMode(true)}>
                                Editează profilul
                            </button>
                            <button
                                className="profileSecondaryButton iconText"
                                onClick={() => setParolaMode((v) => !v)}
                            >
                                <IconLock /> Schimbă parola
                            </button>
                            {!user.esteDonator && (
                                <Link to="/sunt-donator" className="profileSecondaryButton profileLinkButton">
                                    Devino donator
                                </Link>
                            )}
                        </motion.div>
                    </motion.div>
                ) : (
                    <form className="profileForm" onSubmit={handleSubmit}>
                        <div className="profileFormRow">
                            <div className="formField">
                                <label htmlFor="nume">Nume complet</label>
                                <input id="nume" value={nume} onChange={(e) => setNume(e.target.value)} required />
                            </div>
                            <div className="formField">
                                <label htmlFor="telefon">Telefon</label>
                                <input id="telefon" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                            </div>
                        </div>
                        <div className="profileFormRow">
                            <div className="formField">
                                <label htmlFor="oras">Oraș</label>
                                <input id="oras" value={oras} onChange={(e) => setOras(e.target.value)} required />
                            </div>
                            <div className="formField">
                                <label htmlFor="varsta">Vârstă</label>
                                <input
                                    id="varsta"
                                    type="number"
                                    min={18}
                                    max={100}
                                    value={varsta}
                                    onChange={(e) => setVarsta(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="profileFormActions">
                            <button type="submit" className="profileSubmitButton">
                                Salvează modificările
                            </button>
                            <button type="button" className="profileCancelButton" onClick={() => setEditMode(false)}>
                                Renunță
                            </button>
                        </div>
                    </form>
                )}

                {parolaMode && (
                    <form className="profileForm profilePasswordForm" onSubmit={handleSchimbaParola}>
                        <h2 className="profileSectionTitle">Schimbă parola</h2>
                        <div className="profileFormRow">
                            <div className="formField">
                                <label htmlFor="parolaNoua">Parolă nouă</label>
                                <input
                                    id="parolaNoua"
                                    type="password"
                                    value={parolaNoua}
                                    onChange={(e) => setParolaNoua(e.target.value)}
                                    placeholder="Minim 6 caractere"
                                    required
                                />
                            </div>
                            <div className="formField">
                                <label htmlFor="confirmaParola">Confirmă parola</label>
                                <input
                                    id="confirmaParola"
                                    type="password"
                                    value={confirmaParola}
                                    onChange={(e) => setConfirmaParola(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="profileFormActions">
                            <button type="submit" className="profileSubmitButton">
                                Salvează parola
                            </button>
                            <button type="button" className="profileCancelButton" onClick={() => setParolaMode(false)}>
                                Renunță
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

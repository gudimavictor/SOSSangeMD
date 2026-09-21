import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext'
import { ApiError } from '../../api/types'
import { useApi } from '../../api/use-api'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { useCityLabels } from '../../i18n/useCityLabels'
import './LoginPage.css'

type Mode = 'login' | 'inregistrare'
type PasRegistrare = 'email' | 'cod' | 'detalii'

const orase = ['Chișinău', 'Bălți', 'Soroca', 'Comrat', 'Cahul']

function IconEye() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function IconEyeOff() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    )
}

export function LoginPage() {
    const { login } = useAuth()
    const api = useApi()
    const { t } = useTranslation('auth')
    const cityLabels = useCityLabels()
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as { redirect?: string }
    const redirectTo = search.redirect || '/'

    const [mode, setMode] = useState<Mode>('login')
    const [pasRegistrare, setPasRegistrare] = useState<PasRegistrare>('email')
    const [seIncarca, setSeIncarca] = useState(false)
    const [codIntrodus, setCodIntrodus] = useState('')
    const [nume, setNume] = useState('')
    const [email, setEmail] = useState('')
    const [parola, setParola] = useState('')
    const [confirmaParola, setConfirmaParola] = useState('')
    const [telefon, setTelefon] = useState('')
    const [oras, setOras] = useState('')
    const [varsta, setVarsta] = useState('')
    const [confirmVarsta, setConfirmVarsta] = useState(false)
    const [eroare, setEroare] = useState('')
    const [aratParola, setAratParola] = useState(false)
    const [aratParolaR, setAratParolaR] = useState(false)
    const [aratConfirmare, setAratConfirmare] = useState(false)

    function schimbaMode(newMode: Mode) {
        setMode(newMode)
        setEroare('')
        setPasRegistrare('email')
        setCodIntrodus('')
    }

    async function handleTrimiteCod(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        if (!email) {
            setEroare(t('errors.enterEmail'))
            return
        }

        setSeIncarca(true)
        try {
            await api.auth.sendVerificationCode(email)
            setPasRegistrare('cod')
        } catch (e) {
            setEroare(e instanceof Error ? e.message : t('errors.sendCodeFailed'))
        } finally {
            setSeIncarca(false)
        }
    }

    async function handleConfirmaCod(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        setSeIncarca(true)
        try {
            await api.auth.confirmCode(email, codIntrodus)
            setPasRegistrare('detalii')
        } catch (e) {
            setEroare(e instanceof Error ? e.message : t('errors.invalidCode'))
        } finally {
            setSeIncarca(false)
        }
    }

    async function handleLogin(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        setSeIncarca(true)
        try {
            await login(email, parola)
            navigate({ to: redirectTo })
        } catch (e) {
            const status = e instanceof ApiError ? e.status : 0
            setEroare(
                status === 401
                    ? t('errors.invalidCredentials')
                    : e instanceof Error
                      ? e.message
                      : t('errors.loginFailed'),
            )
        } finally {
            setSeIncarca(false)
        }
    }

    async function handleRegister(event: FormEvent) {
        event.preventDefault()
        setEroare('')

        if (!nume || !email || !parola || !oras || !varsta || !telefon) {
            setEroare(t('errors.requiredFields'))
            return
        }

        const varstaNumar = Number(varsta)

        if (!Number.isInteger(varstaNumar) || varstaNumar < 18) {
            setEroare(t('errors.minAge'))
            return
        }

        if (varstaNumar > 100) {
            setEroare(t('errors.invalidAge'))
            return
        }

        if (!confirmVarsta) {
            setEroare(t('errors.confirmAge'))
            return
        }

        if (parola.length < 8) {
            setEroare(t('errors.passwordMin'))
            return
        }

        if (parola !== confirmaParola) {
            setEroare(t('errors.passwordsMismatch'))
            return
        }

        setSeIncarca(true)
        try {
            await api.auth.register({ nume, email, parola, telefon, oras, varsta: varstaNumar })
            await login(email, parola)
            navigate({ to: redirectTo })
        } catch (e) {
            setEroare(e instanceof Error ? e.message : t('errors.registerFailed'))
        } finally {
            setSeIncarca(false)
        }
    }

    return (
        <div className="authShell">
            <div className="authVisual">
                <svg className="authVisualIcon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 2C12 2 5 10.5 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10.5 12 2 12 2Z"
                        fill="white"
                    />
                </svg>
                <p className="authVisualTitle">{t('visual.title')}</p>
                <p className="authVisualText">{t('visual.text')}</p>
            </div>

            <div className="authFormSide">
                <LanguageSwitcher className="authLanguageSwitcher" />
                <div className="loginPage">
                    <h1 className="loginTitle">SOS Sânge</h1>
                    <p className="loginSubtitle">
                        {mode === 'login' ? t('subtitle.login') : t('subtitle.register')}
                    </p>

                    <div className="loginCard">
                        <div className="authTabs">
                            <button
                                type="button"
                                className={`authTab ${mode === 'login' ? 'authTabActive' : ''}`}
                                onClick={() => schimbaMode('login')}
                            >
                                {t('tabs.login')}
                            </button>
                            <button
                                type="button"
                                className={`authTab ${mode === 'inregistrare' ? 'authTabActive' : ''}`}
                                onClick={() => schimbaMode('inregistrare')}
                            >
                                {t('tabs.register')}
                            </button>
                        </div>

                        {eroare && <p className="errorText">{eroare}</p>}

                        {mode === 'login' ? (
                            <form onSubmit={handleLogin}>
                                <div className="loginField">
                                    <label htmlFor="email">{t('fields.email')}</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ana@exemplu.md"
                                        required
                                    />
                                </div>
                                <div className="loginField">
                                    <label htmlFor="parola">{t('fields.password')}</label>
                                    <div className="passwordWrapper">
                                        <input
                                            id="parola"
                                            type={aratParola ? 'text' : 'password'}
                                            value={parola}
                                            onChange={(e) => setParola(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setAratParola((prev) => !prev)}
                                        >
                                            {aratParola ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="loginButton" disabled={seIncarca}>
                                    {t('buttons.login')}
                                </button>
                            </form>
                        ) : pasRegistrare === 'email' ? (
                            <form onSubmit={handleTrimiteCod}>
                                <div className="loginField">
                                    <label htmlFor="email-r">{t('fields.email')}</label>
                                    <input
                                        id="email-r"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ana@exemplu.md"
                                        required
                                    />
                                </div>
                                <button type="submit" className="loginButton" disabled={seIncarca}>
                                    {t('buttons.sendCode')}
                                </button>
                            </form>
                        ) : pasRegistrare === 'cod' ? (
                            <form onSubmit={handleConfirmaCod}>
                                <p className="loginNote">
                                    <Trans
                                        i18nKey="codeSent"
                                        ns="auth"
                                        values={{ email }}
                                        components={{ strong: <strong /> }}
                                    />
                                </p>
                                <div className="loginField">
                                    <label htmlFor="cod">{t('fields.code')}</label>
                                    <input
                                        id="cod"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={codIntrodus}
                                        onChange={(e) => setCodIntrodus(e.target.value)}
                                        placeholder="123456"
                                        required
                                    />
                                </div>
                                <button type="submit" className="loginButton" disabled={seIncarca}>
                                    {t('buttons.confirmCode')}
                                </button>
                                <button
                                    type="button"
                                    className="loginButton loginButtonSecundar"
                                    onClick={() => setPasRegistrare('email')}
                                >
                                    {t('buttons.back')}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister}>
                                <p className="loginNote">
                                    <Trans
                                        i18nKey="emailConfirmed"
                                        ns="auth"
                                        values={{ email }}
                                        components={{ strong: <strong /> }}
                                    />
                                </p>
                                <div className="loginField">
                                    <label htmlFor="nume">{t('fields.fullName')}</label>
                                    <input
                                        id="nume"
                                        type="text"
                                        value={nume}
                                        onChange={(e) => setNume(e.target.value)}
                                        placeholder="Ana Popescu"
                                        required
                                    />
                                </div>
                                <div className="loginField">
                                    <label htmlFor="telefon">{t('fields.phone')}</label>
                                    <input
                                        id="telefon"
                                        type="text"
                                        value={telefon}
                                        onChange={(e) => setTelefon(e.target.value)}
                                        placeholder="+373 69 123 456"
                                    />
                                </div>
                                <div className="loginField">
                                    <label>{t('fields.city')}</label>
                                    <CustomSelect
                                        options={orase}
                                        value={oras}
                                        onChange={setOras}
                                        placeholder={t('placeholders.city')}
                                        labels={cityLabels}
                                    />
                                </div>
                                <div className="loginField">
                                    <label htmlFor="varsta">{t('fields.age')}</label>
                                    <input
                                        id="varsta"
                                        type="number"
                                        min={18}
                                        max={100}
                                        value={varsta}
                                        onChange={(e) => setVarsta(e.target.value)}
                                        placeholder={t('placeholders.age')}
                                        required
                                    />
                                </div>
                                <div className="confirmField">
                                    <label className="confirmCheckboxLabel">
                                        <input
                                            type="checkbox"
                                            checked={confirmVarsta}
                                            onChange={(e) => setConfirmVarsta(e.target.checked)}
                                        />
                                        <span>{t('declaration')}</span>
                                    </label>
                                </div>
                                <div className="loginField">
                                    <label htmlFor="parola-r">{t('fields.password')}</label>
                                    <div className="passwordWrapper">
                                        <input
                                            id="parola-r"
                                            type={aratParolaR ? 'text' : 'password'}
                                            value={parola}
                                            onChange={(e) => setParola(e.target.value)}
                                            placeholder={t('placeholders.passwordMin')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setAratParolaR((prev) => !prev)}
                                        >
                                            {aratParolaR ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="loginField">
                                    <label htmlFor="confirmaParola">{t('fields.confirmPassword')}</label>
                                    <div className="passwordWrapper">
                                        <input
                                            id="confirmaParola"
                                            type={aratConfirmare ? 'text' : 'password'}
                                            value={confirmaParola}
                                            onChange={(e) => setConfirmaParola(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="passwordToggle"
                                            onClick={() => setAratConfirmare((prev) => !prev)}
                                        >
                                            {aratConfirmare ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="loginButton" disabled={seIncarca}>
                                    {t('buttons.createAccount')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
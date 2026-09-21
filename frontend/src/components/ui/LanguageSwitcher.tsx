import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../../i18n'
import './LanguageSwitcher.css'

const languageNames = { ro: 'Română', en: 'English', ru: 'Русский' }

type LanguageSwitcherProps = {
    className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
    const { i18n, t } = useTranslation()
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const current = supportedLanguages.find((language) => language === i18n.resolvedLanguage) ?? 'ro'

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    function choose(language: (typeof supportedLanguages)[number]) {
        i18n.changeLanguage(language)
        setOpen(false)
    }

    return (
        <div ref={containerRef} className={`languageSwitcher ${className}`}>
            <button
                type="button"
                className="languageTrigger"
                aria-label={t('language.label')}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span>{current.toUpperCase()}</span>
                <svg
                    className={`languageChevron ${open ? 'languageChevronOpen' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <ul className="languageMenu" role="listbox">
                    {supportedLanguages.map((language) => (
                        <li key={language} role="option" aria-selected={language === current}>
                            <button
                                type="button"
                                className={`languageOption ${language === current ? 'languageOptionSelected' : ''}`}
                                onClick={() => choose(language)}
                            >
                                <span className="languageOptionCode">{language.toUpperCase()}</span>
                                <span>{languageNames[language]}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import roAuth from './locales/ro/auth.json'
import roCommon from './locales/ro/common.json'
import ruAuth from './locales/ru/auth.json'
import ruCommon from './locales/ru/common.json'

export const supportedLanguages = ['ro', 'en', 'ru'] as const

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ro: { common: roCommon, auth: roAuth },
            en: { common: enCommon, auth: enAuth },
            ru: { common: ruCommon, auth: ruAuth },
        },
        fallbackLng: 'ro',
        supportedLngs: [...supportedLanguages],
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        defaultNS: 'common',
        ns: ['common', 'auth'],
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'sos-sange-language',
        },
    })

function applyHtmlLanguage(language: string) {
    document.documentElement.lang = language
}

applyHtmlLanguage(i18n.resolvedLanguage ?? 'ro')
i18n.on('languageChanged', applyHtmlLanguage)

export default i18n

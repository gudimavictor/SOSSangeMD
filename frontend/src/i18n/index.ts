import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enLayout from './locales/en/layout.json'
import roAuth from './locales/ro/auth.json'
import roCommon from './locales/ro/common.json'
import roHome from './locales/ro/home.json'
import roLayout from './locales/ro/layout.json'
import ruAuth from './locales/ru/auth.json'
import ruCommon from './locales/ru/common.json'
import ruHome from './locales/ru/home.json'
import ruLayout from './locales/ru/layout.json'

export const supportedLanguages = ['ro', 'en', 'ru'] as const

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ro: { common: roCommon, auth: roAuth, layout: roLayout, home: roHome },
            en: { common: enCommon, auth: enAuth, layout: enLayout, home: enHome },
            ru: { common: ruCommon, auth: ruAuth, layout: ruLayout, home: ruHome },
        },
        fallbackLng: 'ro',
        supportedLngs: [...supportedLanguages],
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        defaultNS: 'common',
        ns: ['common', 'auth', 'layout', 'home'],
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

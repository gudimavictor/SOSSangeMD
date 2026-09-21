import { useTranslation } from 'react-i18next'

const dateLocales: Record<string, string> = {
    ro: 'ro-RO',
    en: 'en-GB',
    ru: 'ru-RU',
}

export function useDateLocale(): string {
    const { i18n } = useTranslation()
    return dateLocales[i18n.resolvedLanguage ?? 'ro'] ?? 'ro-RO'
}

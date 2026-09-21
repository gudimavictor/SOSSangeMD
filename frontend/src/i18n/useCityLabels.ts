import { useTranslation } from 'react-i18next'

const cityKeys: Record<string, string> = {
    'Chișinău': 'chisinau',
    'Bălți': 'balti',
    Soroca: 'soroca',
    Comrat: 'comrat',
    Cahul: 'cahul',
}

export function useCityLabels(): Record<string, string> {
    const { t } = useTranslation()
    return Object.fromEntries(Object.entries(cityKeys).map(([city, key]) => [city, t(`cities.${key}`)]))
}

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'
import { AxiosContext } from './context'
import { setupInterceptors } from './interceptors'

type AxiosProviderProps = {
    children: ReactNode
    baseURL: string
}

export function AxiosProvider({ children, baseURL }: AxiosProviderProps) {
    const client = useMemo(() => {
        const instance = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } })
        setupInterceptors(instance, baseURL)
        return instance
    }, [baseURL])

    return <AxiosContext.Provider value={client}>{children}</AxiosContext.Provider>
}

import { useContext, useMemo } from 'react'
import { AxiosContext } from './context'
import { createApi } from './create-api'

export function useApi() {
    const client = useContext(AxiosContext)
    if (!client) {
        throw new Error('useApi trebuie folosit în interiorul AxiosProvider')
    }
    return useMemo(() => createApi(client), [client])
}

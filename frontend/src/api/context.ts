import { createContext } from 'react'
import type { AxiosInstance } from 'axios'

export const AxiosContext = createContext<AxiosInstance | null>(null)

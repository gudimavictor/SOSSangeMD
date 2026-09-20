import { RouterProvider } from '@tanstack/react-router'
import { AxiosProvider } from '../api/axios-provider'
import { AuthProvider } from '../features/auth/AuthProvider'
import { router } from './router'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5079'

function App() {
    return (
        <AxiosProvider baseURL={API_URL}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </AxiosProvider>
    )
}

export default App
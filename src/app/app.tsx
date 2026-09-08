import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider } from '../features/auth/AuthProvider'
import { router } from './router'

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    )
}

export default App
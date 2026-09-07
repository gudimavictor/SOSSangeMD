import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const donorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sunt-donator',
    component: () => <div style={{ padding: '2rem' }}><h1>Sunt donator</h1><p>În construcție.</p></div>,
})
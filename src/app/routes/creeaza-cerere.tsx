import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const createRequestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/creeaza-cerere',
    component: () => <div style={{ padding: '2rem' }}><h1>Creează cerere</h1><p>În construcție.</p></div>,
})
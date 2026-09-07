import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const myRequestsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cererile-mele',
    component: () => <div style={{ padding: '2rem' }}><h1>Cererile mele</h1><p>În construcție.</p></div>,
})
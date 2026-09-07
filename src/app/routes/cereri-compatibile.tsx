import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const compatibleRequestsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cereri-compatibile',
    component: () => <div style={{ padding: '2rem' }}><h1>Cereri compatibile</h1><p>În construcție.</p></div>,
})
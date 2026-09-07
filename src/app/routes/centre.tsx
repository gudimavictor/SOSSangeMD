import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const centersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/centre',
    component: () => <div style={{ padding: '2rem' }}><h1>Centre de transfuzie</h1><p>În construcție.</p></div>,
})
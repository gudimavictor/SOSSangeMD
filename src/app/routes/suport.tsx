import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const supportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/suport',
    component: () => <div style={{ padding: '2rem' }}><h1>Suport</h1><p>Pentru întrebări: suport@sossange.md</p></div>,
})
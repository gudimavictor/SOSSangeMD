import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { SupportPage } from '../../features/support/SupportPage'

export const supportRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/suport',
    component: SupportPage,
})
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { CreateRequestPage } from '../../features/requests/RequestsPage'

export const createRequestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/creeaza-cerere',
    component: CreateRequestPage,
})
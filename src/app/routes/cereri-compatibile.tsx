import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { CompatibleRequestsPage } from '../../features/compatible-requests/CompatibleRequestsPage'

export const compatibleRequestsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cereri-compatibile',
    component: CompatibleRequestsPage,
})
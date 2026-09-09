import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { MyRequestsPage } from '../../features/requests/MyRequestsPage'

export const myRequestsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cererile-mele',
    component: MyRequestsPage,
})
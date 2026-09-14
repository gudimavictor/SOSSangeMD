import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { NotificationsPage } from '../../features/notifications/NotificationsPage'

export const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/notificari',
    component: NotificationsPage,
})
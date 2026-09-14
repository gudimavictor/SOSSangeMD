import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { AdminDashboardPage } from '../../features/admin/AdminDashboardPage'

export const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminDashboardPage,
})
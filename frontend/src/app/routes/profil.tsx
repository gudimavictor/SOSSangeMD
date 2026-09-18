import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { ProfilePage } from '../../features/profile/ProfilePage'

export const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profil',
    component: ProfilePage,
})

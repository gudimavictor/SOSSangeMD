import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { DonorPage } from '../../features/donor/DonorPage'

export const donorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sunt-donator',
    component: DonorPage,
})
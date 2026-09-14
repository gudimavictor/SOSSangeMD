import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { CentersPage } from '../../features/centers/CentersPage'

export const centersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/centre',
    component: CentersPage,
})
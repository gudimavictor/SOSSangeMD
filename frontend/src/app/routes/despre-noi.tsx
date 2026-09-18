import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { AboutPage } from '../../features/about/AboutPage'

export const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/despre-noi',
    component: AboutPage,
})

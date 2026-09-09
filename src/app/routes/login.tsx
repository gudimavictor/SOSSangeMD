import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { LoginPage } from '../../features/auth/LoginPage'

type LoginSearch = {
    redirect?: string
}

export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    validateSearch: (search: Record<string, unknown>): LoginSearch => ({
        redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }),
    component: LoginPage,
})
import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { homeRoute } from './routes/index'
import { loginRoute } from './routes/login'
import { createRequestRoute } from './routes/creeaza-cerere'
import { myRequestsRoute } from './routes/cererile-mele'
import { donorRoute } from './routes/sunt-donator'
import { compatibleRequestsRoute } from './routes/cereri-compatibile'
import { centersRoute } from './routes/centre'
import { supportRoute } from './routes/suport'

const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    createRequestRoute,
    myRequestsRoute,
    donorRoute,
    compatibleRequestsRoute,
    centersRoute,
    supportRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
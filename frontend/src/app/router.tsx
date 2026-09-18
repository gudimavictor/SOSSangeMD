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
import { adminRoute } from './routes/admin'
import { notificationsRoute } from './routes/notificari'
import { profileRoute } from './routes/profil'
import { aboutRoute } from './routes/despre-noi'

const routeTree = rootRoute.addChildren([
    homeRoute,
    loginRoute,
    createRequestRoute,
    myRequestsRoute,
    donorRoute,
    compatibleRequestsRoute,
    centersRoute,
    supportRoute,
    adminRoute,
    notificationsRoute,
    profileRoute,
    aboutRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { createAuthApi } from './auth'
import { createCentersApi } from './centers'
import { createNotificationsApi } from './notifications'
import { createRequestsApi } from './requests'
import { createResponsesApi } from './responses'
import { createSupportApi } from './support'
import type { RequestFn, RequestOptions } from './types'
import { createUsersApi } from './users'

function makeRequest(client: AxiosInstance): RequestFn {
    return async <T = void>(path: string, options: RequestOptions = {}) => {
        const { method = 'GET', body, auth = true } = options
        const config: AxiosRequestConfig & { _public?: boolean } = {
            url: path,
            method,
            data: body,
            _public: !auth,
        }
        const res = await client.request<T>(config)
        return res.data
    }
}

export function createApi(client: AxiosInstance) {
    const request = makeRequest(client)

    return {
        auth: createAuthApi(request),
        users: createUsersApi(request),
        requests: createRequestsApi(request),
        responses: createResponsesApi(request),
        notifications: createNotificationsApi(request),
        centers: createCentersApi(request),
        support: createSupportApi(request),
    }
}

export type Api = ReturnType<typeof createApi>

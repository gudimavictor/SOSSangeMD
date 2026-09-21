import { useEffect, useEffectEvent, useState } from 'react'

type Result<T> = { key: string; data?: T; error?: string }

export function useAsync<T>(
    fetcher: () => Promise<T>,
    deps: readonly (string | number | boolean | null)[],
    enabled = true,
) {
    const [version, setVersion] = useState(0)
    const [result, setResult] = useState<Result<T> | null>(null)

    const depsKey = JSON.stringify(deps)
    const load = useEffectEvent(fetcher)

    useEffect(() => {
        if (!enabled) return
        let cancelled = false
        load()
            .then((data) => {
                if (!cancelled) setResult({ key: depsKey, data })
            })
            .catch((e: unknown) => {
                if (!cancelled) setResult({ key: depsKey, error: e instanceof Error ? e.message : 'Eroare necunoscută' })
            })
        return () => {
            cancelled = true
        }
    }, [depsKey, version, enabled])

    const current = result?.key === depsKey ? result : null

    return {
        data: current?.data,
        error: current?.error ?? '',
        loading: enabled && current === null,
        reload: () => setVersion((v) => v + 1),
    }
}

import type { UseQueryOptions } from '@tanstack/vue-query'
import { isFunction } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { useWeilaApi } from './useWeilaApi'

export function useWeilaFetch<T>(
  url: MaybeRefOrGetter<string>,
  options?: UseQueryOptions<T> & {
    body?: MaybeRefOrGetter<RequestInit['body'] | Record<string, any>>
    method?: string
  },
) {
  const { body, method = 'POST' } = options || {}

  const weilaApi = useWeilaApi()

  const res = useQuery<T>({
    queryKey: [url, body, method],
    queryFn: () => weilaApi.value.v2.fetch(toValue(url), {
      body: toValue(body),
      method,
    }),
    refetchOnWindowFocus: false,
    ...options,
  })

  const { refetch } = res

  if (body && (isRef(body) || isFunction(body))) {
    watch([body, url], () => {
      refetch()
    }, { deep: true })
  }

  return res
}

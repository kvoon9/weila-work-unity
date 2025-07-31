import type { UseQueryOptions } from '@tanstack/vue-query'
import { isFunction } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { parseURL } from 'ufo'
import { useWeilaApi } from './useWeilaApi'

export function useWeilaFetch<T>(
  url: MaybeRefOrGetter<string>,
  options?: {
    body?: MaybeRefOrGetter<RequestInit['body'] | Record<string, any>>
    method?: string
  },
  tanstackOptions?: UseQueryOptions<T>,
) {
  const { body, method = 'POST' } = toValue(options) || {}

  const weilaApi = useWeilaApi()

  const res = useQuery<T>({
    queryKey: [() => parseURL(toValue(url)).pathname, body, method],
    queryFn: () => weilaApi.value.v2.fetch(toValue(url), {
      body: toValue(body),
      method,
    }),
    refetchOnWindowFocus: false,
    ...tanstackOptions,
  })

  const { refetch } = res

  if (body && (isRef(body) || isFunction(body))) {
    watch([body, url], () => {
      refetch()
    }, { deep: true })
  }

  return res
}

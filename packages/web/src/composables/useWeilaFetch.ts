import type { UseQueryOptions } from '@tanstack/vue-query'
import { isFunction } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { parseURL } from 'ufo'
import { computed, isRef, toValue, watch } from 'vue'
import { useWeilaApi } from './useWeilaApi'

export function useWeilaFetch<T>(
  url: MaybeRefOrGetter<string>,
  options?: {
    body?: MaybeRefOrGetter<RequestInit['body'] | Record<string, any>>
    method?: string
    pick?: string[]
  },
  tanstackOptions?: Omit<UseQueryOptions<T>, 'queryKey'>,
) {
  const { body, method = 'POST', pick } = toValue(options) || {}

  const weilaApi = useWeilaApi()

  const res = useQuery<T>({
    queryKey: [() => parseURL(toValue(url)).pathname, body, method],
    queryFn: () => weilaApi.value.v2.fetch(toValue(url), {
      body: toValue(body),
      method,
    }),
    retry: (failCount, error) => {
      if (failCount > 3)
        return false

      if (error?.message && JSON.parse(error.message).errcode === 32)
        return false

      return true
    },
    refetchOnWindowFocus: false,
    ...tanstackOptions,
  })

  const { refetch } = res

  if (body && (isRef(body) || isFunction(body))) {
    watch(body, () => {
      // @ts-expect-error type error
      if (toValue(tanstackOptions?.enabled) !== false)
        refetch()
    }, { deep: true })
  }
  if (isRef(url) || isFunction(url)) {
    watch(url, () => {
      // @ts-expect-error type error
      if (toValue(tanstackOptions?.enabled) !== false)
        refetch()
    })
  }

  return {
    ...res,
    data: computed(() => {
      if (!res.data.value)
        return res.data.value

      if (!pick || pick.length === 0)
        return res.data.value

      if (pick.length === 1)
        return res.data.value[pick[0] as keyof T]

      return pick.reduce((obj, key) => {
        obj[key] = res.data.value?.[key as keyof T]
        return obj
      }, {} as any)
    }) as ComputedRef<T>,
  }
}

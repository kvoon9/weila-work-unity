import type { MutationOptions } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import { useWeilaApi } from './useWeilaApi'

export function useWeilaMutation<T>(
  url: string,
  options: MutationOptions = {},
) {
  const weilaApi = useWeilaApi()

  return useMutation<T>({
    mutationKey: [url],
    // @ts-expect-error type error
    mutationFn: (body: any) => weilaApi.value.v2.fetch(url, {
      body,
    }),
    ...options,
  })
}

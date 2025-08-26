/* eslint-disable ts/ban-ts-comment */
// @ts-nocheck type inter too deep
export function useWeilaFetch<DataT = void>(
  ...args: Parameters<typeof useFetch<DataT>>
) {
  const weilaApi = useWeilaApi()
  const [url, options] = args

  return useFetch(
    url,
    {
      ...options,
      // @ts-expect-error type error
      $fetch: weilaApi.value.v2.fetch,
    },
  )
}

// import { weilaRequest } from '~/api/instances/request'
import type { UserModule } from '~/types'
// import type { QueryFunction, VueQueryPluginOptions } from '@tanstack/vue-query'
// import { objectPick } from '@antfu/utils'
import { VueQueryPlugin } from '@tanstack/vue-query'

// // TODO: improve type
// const defaultQueryFn: QueryFunction<any, [string, MaybeRef<object> | ComputedRef<object>, string[]]> = async ({ queryKey }) => {
//   const [url, params, returnKeys] = queryKey

//   const data = await weilaRequest.post(url, unref(params))

//   return objectPick(data.data, returnKeys, true)
// }

// const vueQueryPluginOptions: VueQueryPluginOptions = {
//   queryClientConfig: {
//     // TODO: improve type
//     // @ts-expect-error type error
//     defaultOptions: { queries: { queryFn: defaultQueryFn } },
//   },
// }

export const install: UserModule = ({ app }) => {
  app.use(VueQueryPlugin /* vueQueryPluginOptions */)
}

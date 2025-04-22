import type { CreateWeilaApiOptions } from './base'
import { createFetch } from './base'
import { getV2Options } from './utils'

export function createWeilaFetchV2(opts?: CreateWeilaApiOptions) {
  return createFetch({
    baseURL: '/v2',
    options: getV2Options,
    ...(opts || {}),
  })
}

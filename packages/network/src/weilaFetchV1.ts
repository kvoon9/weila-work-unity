import type { CreateWeilaApiOptions } from './base'
import { createFetch } from './base'
import { getV1Options } from './utils'

export function createWeilaFetchV1(opts?: CreateWeilaApiOptions) {
  return createFetch({
    baseURL: '/v1',
    options: getV1Options,
    ...(opts || {}),
  })
}

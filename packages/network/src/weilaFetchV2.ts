import type { CreateWeilaApiOptions } from './base'
import { createFetch } from './base'
import { getOptionsV2 } from './utils'

export function createWeilaFetchV2(opts?: CreateWeilaApiOptions) {
  return createFetch({
    baseURL: '/v2',
    options: getOptionsV2,
    ...(opts || {}),
  })
}

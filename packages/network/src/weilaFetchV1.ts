import type { CreateWeilaApiOptions } from './base'
import { createFetch } from './base'
import { getOptionsV1 } from './utils'

export function createWeilaFetchV1(opts?: CreateWeilaApiOptions) {
  return createFetch({
    baseURL: '/v1',
    options: getOptionsV1,
    ...(opts || {}),
  })
}

import type { CreateWeilaApiOptions } from './base'
import { createRequest } from './base'
import { getV2Options } from './utils'

export function createWeilaRequestV2(opts?: CreateWeilaApiOptions) {
  return createRequest({
    baseURL: 'v2',
    options: getV2Options,
    ...(opts || {}),
  })
}

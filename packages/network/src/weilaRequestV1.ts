import type { CreateWeilaApiOptions } from './base'
import { createRequest } from './base'
import { getV1Options } from './utils'

export function createWeilaRequestV1(opts?: CreateWeilaApiOptions) {
  return createRequest({
    baseURL: 'v1',
    options: getV1Options,
    ...(opts || {}),
  })
}

import type { CreateWeilaApiOptions } from './base'
import { createRequest } from './base'
import { getOptionsV1 } from './utils'

export function createWeilaRequestV1(opts?: CreateWeilaApiOptions) {
  return createRequest({
    baseURL: 'v1',
    options: getOptionsV1,
    ...(opts || {}),
  })
}

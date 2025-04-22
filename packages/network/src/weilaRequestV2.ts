import type { CreateWeilaApiOptions } from './base'
import { createRequest } from './base'
import { getOptionsV2 } from './utils'

export function createWeilaRequestV2(opts?: CreateWeilaApiOptions) {
  return createRequest({
    baseURL: 'v2',
    options: getOptionsV2,
    ...(opts || {}),
  })
}

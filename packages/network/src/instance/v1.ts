import type { CreateWeilaApiOptions } from '../types'
import md5 from 'md5'
import { createFetch, createRequest } from '../utils'

export function createWeilaFetchV1(opts?: CreateWeilaApiOptions) {
  return createFetch({
    baseURL: '/v1',
    options: getOptionsV1,
    ...(opts || {}),
  })
}

export function createWeilaRequestV1(opts?: CreateWeilaApiOptions) {
  return createRequest({
    baseURL: 'v1',
    options: getOptionsV1,
    ...(opts || {}),
  })
}

export function getOptionsV1() {
  const app_id = '102036'
  const key = 'b3c658bd2e637c65efb134fb381d4a18'
  const access_token = localStorage.getItem('token') || ''
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${key}`)

  return {
    'app_id': app_id,
    'access-token': access_token,
    'et': String(et),
    'sign': app_sign,
  }
}

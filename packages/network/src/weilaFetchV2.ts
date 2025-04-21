import type { CreateWeilaFetchOptions } from '.'
import md5 from 'md5'
import { createFetch } from '.'

function getMd5Middle8Chars(md5: string) {
  // 888e0f79573741ac3e1f09a3c9e46968 -> 41ac3e1f
  return md5.slice(12, 20)
}

export function createWeilaFetchV2(opts?: CreateWeilaFetchOptions) {
  return createFetch({
    baseURL: '/v2',
    options() {
      const app_id = '102036'
      const key = 'b3c658bd2e637c65efb134fb381d4a18'
      const access_token = localStorage.getItem('token') || ''
      const timestamp = Date.now() || -1
      const et = Math.floor(timestamp / 1000)
      const app_sign = md5(`${et}${key}`)
      const app_sign_v2 = getMd5Middle8Chars(app_sign)

      return {
        appid: app_id,
        token: access_token,
        et: String(et),
        sign: app_sign_v2,
      }
    },
    ...(opts || {}),
  })
}

import type { WeilaRes } from '..'
import { Message } from '@arco-design/web-vue'
import { ofetch } from 'ofetch'
import { et } from '~/shared/states'
import { useAuthStore } from '~/stores/auth'
import defaultConfig, { WeilaErrorCode, weilaLogoutErrorCodes } from '..'

export const weilaFetchV2 = ofetch.create({
  ...defaultConfig,
  baseURL: '/v2',
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest({ options }) {
    const { access_token, app_id, app_sign_v2 } = useAuthStore()

    options.query = {
      appid: app_id,
      token: access_token,
      et: String(et.value),
      sign: app_sign_v2,
      ...options.query,
    }
  },
  onResponse({ response }): any {
    const { logout } = useAuthStore()
    const { errcode, errmsg } = response._data as WeilaRes

    if (errcode === WeilaErrorCode.SUCCESS) {
      // response._data = { data: undefined, ...response._data.data }
      response._data = response._data.data
    }
    else if (
      weilaLogoutErrorCodes
        .findIndex(i => errcode === i) >= 0
    ) {
      logout()
    }
    else {
      Message.error(`${errcode} ${errmsg}`)
    }
  },
  onResponseError({ error }) {
    Message.error(error?.message || 'Unknown Fetch Error')
  },
})

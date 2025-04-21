import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { WeilaRes } from '..'
import { Message } from '@arco-design/web-vue'
import axios from 'axios'
import { et } from '~/shared/states'
import { useAuthStore } from '~/stores/auth'
import defaultConfig, { WeilaErrorCode, weilaLogoutErrorCodes } from '..'

interface WeilaRequestInstance extends AxiosInstance {
  post: <T = any, R = WeilaRes<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}

interface WeilaRequestConfig<D = any> extends InternalAxiosRequestConfig<D> {
  params?: {
    appid: string
    token: string
    et: string
    sign: string
  }
  data?: D
}

export const weilaRequestV2: WeilaRequestInstance = axios.create({
  ...defaultConfig,
  baseURL: '/v2',
})

weilaRequestV2.interceptors.request.use(
  (config: WeilaRequestConfig) => {
    const { access_token, app_id, app_sign_v2 } = useAuthStore()

    if (config && access_token) {
      config.params = {
        ...config.params,
        appid: app_id,
        token: access_token,
        et: String(et.value),
        sign: app_sign_v2,
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

weilaRequestV2.interceptors.response.use(
  // @ts-expect-error type error
  (response: AxiosResponse<WeilaRes>) => {
    const { logout } = useAuthStore()
    const { errcode, code } = response.data

    if (errcode === WeilaErrorCode.SUCCESS || code === 200) {
      return response.data
      // return { data: undefined, ...response.data }
    }
    else if (
      weilaLogoutErrorCodes
        .findIndex(i => errcode === i) >= 0
    ) {
      logout()
    }
    else {
      const message = `${response.data.errcode} ${response.data.errmsg}`
      Message.error(message)
      throw new Error(message)
    }
  },
  (error: Error) => {
    Message.error(error.message)
    return Promise.reject(error)
  },
)

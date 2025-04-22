import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import type weilaApiList from '~~/fixture/mock'
import axios from 'axios'
import { parseURL } from 'ufo'
import { headers, isDev, isMocking } from '~/shared/const'
import { et } from '~/shared/states'

export interface WeilaRequestInstance extends AxiosInstance {
  post: <T = any, R = WeilaRes<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}

export interface WeilaRequestConfig<D = any> extends InternalAxiosRequestConfig<D> {
  params?: {
    'access-token': string
    'app_id': string
    'et': string
    'sign': string
  }
  data?: D
}

export interface WeilaRequestConfigV2<D = any> extends InternalAxiosRequestConfig<D> {
  params?: {
    appid: string
    token: string
    et: string
    sign: string
  }
  data?: D
}

export enum WeilaErrorCode {
  SUCCESS = 0,
  TOKEN_INVALID = 31,
  USER_IS_NOT_REGIST_CORP = 45016,
}

export interface WeilaRes<T = undefined> {
  data?: T

  errmsg: string
  errcode: number

  code?: number
  msg?: string
}

export const weilaLogoutErrorCodes = [
  WeilaErrorCode.TOKEN_INVALID,
  WeilaErrorCode.USER_IS_NOT_REGIST_CORP,
]

export type WeilaApiUrl = typeof weilaApiList[number]['route']
export type WeilaApiUrlShort = WeilaApiUrl extends `/v1${infer Suffix}` ? Suffix : never

export const publicApi: WeilaApiUrl[] = [
  '/v1/corp/web/login',
  '/v1/corp/web/login-by-name',
  '/v1/corp/web/login-by-phone',
  '/v1/corp/web/send-sms-verifycode',
  '/v1/corp/web/regist',
  '/v1/corp/web/reset-password',
  // TODO: fix in apipost-mock-gen
  // @ts-expect-error type error
  '/v1/corp/web/get-verifycode-image',
] as const

export function weilaApiUrl(key: WeilaApiUrlShort) {
  return key
}

// const { toast } = useToast()

export function useBaseURL(base: string, proxy: string) {
  /**
   * dev, mock -> v1
   * dev, no mock -> proxy
   * prod -> {protocol}//demo.weila.hk/v1
   */
  // const apiHosts = ['demo.weila.hk']
  const apiHosts = ['demo.weila.hk', 'demoui.weila.hk']

  if (isDev.value)
    return isMocking.value ? base : proxy

  let {
    protocol = '',
    host = '',
  } = parseURL(window.location.href)

  if (!apiHosts.some(apiHost => window.location.href.includes(apiHost)))
    host = apiHosts[0]

  // make sure the api be top domain
  return `${protocol}//${host}/${base}`
}

const baseConfig = computed(() => (reactive({
  baseURL: useBaseURL('v1', 'proxy'),
  timeout: 20 * 1000,
  method: 'POST',
  headers: {
    ...headers,
    'Content-Type': 'application/json',
  },
  // mode: 'no-cors',
  mode: 'cors',
} as const)))

export default defineNuxtPlugin(() => {
  const weilaFetch = $fetch.create(baseConfig.value)

  // const weilaRequest: WeilaRequestInstance = axios.create({
  //   ...baseConfig.value,
  // })

  // weilaRequest.interceptors.request.use(
  //   (config: WeilaRequestConfig) => {
  //     const { access_token, app_id, app_sign } = useAuthStore()

  //     if (config && access_token) {
  //       config.params = {
  //         ...config.params,
  //         'app_id': app_id,
  //         'access-token': access_token,
  //         'et': String(et.value),
  //         'sign': app_sign,
  //       }
  //     }

  //     return config
  //   },
  //   (error) => {
  //     return Promise.reject(error)
  //   },
  // )

  // weilaRequest.interceptors.response.use(
  //   // @ts-expect-error type error
  //   (response: AxiosResponse<WeilaRes>) => {
  //     const { logout } = useAuthStore()
  //     const { errcode, code } = response.data

  //     if (errcode === WeilaErrorCode.SUCCESS || code === 200) {
  //       return response.data
  //     // return { data: undefined, ...response.data }
  //     }
  //     else if (
  //       weilaLogoutErrorCodes
  //         .findIndex(i => errcode === i) >= 0
  //     ) {
  //       logout()
  //     }
  //     else {
  //       const { errcode, errmsg } = response.data

  //       toast({
  //         title: `Oops: ${errcode}`,
  //         description: `${errmsg}`,
  //       })

  //       throw new Error(`${errcode} ${errmsg}`)
  //     }
  //   },
  //   (error: Error) => {
  //     toast({
  //       title: `Oops`,
  //       description: `${String(error)}`,
  //     })
  //     return Promise.reject(error)
  //   },
  // )

  return {
    provide: {
      v1: $v1,
      v2: $v2,
      weilaFetch,
      weilaRequest: $weilaRequestV1,
    },
  }
})

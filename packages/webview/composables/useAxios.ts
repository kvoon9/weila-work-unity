import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { WeilaRequestConfig, WeilaRequestConfigV2, WeilaRes } from '~/plugins/api'
import { isObject, objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import axios from 'axios'
import { useBaseURL, WeilaErrorCode, weilaLogoutErrorCodes } from '~/plugins/api'
import { et } from '~/shared/states'

interface WeilaAxiosInstance extends AxiosInstance {
  post: <T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}

const { toast } = useToast()

export const weilaAxiosInstanceV1: WeilaAxiosInstance = axios.create({
  timeout: 20 * 1000,
  baseURL: useBaseURL('v1', 'proxy'),
})
weilaAxiosInstanceV1.interceptors.request.use(requestSuccessInterceptor, errorInterceptor)
// @ts-expect-error type error
weilaAxiosInstanceV1.interceptors.response.use(responseSuccessInterceptor, errorInterceptor)

export const weilaAxiosInstanceV2: WeilaAxiosInstance = axios.create({
  timeout: 20 * 1000,
  baseURL: useBaseURL('v2', 'proxy2'),
})
weilaAxiosInstanceV2.interceptors.request.use(requestSuccessInterceptorV2, errorInterceptor)
// @ts-expect-error type error
weilaAxiosInstanceV2.interceptors.response.use(responseSuccessInterceptor, errorInterceptor)

export function useAxios<T>(url: string, options?: {
  version?: 'v1' | 'v2'
} & AxiosRequestConfig) {
  const {
    version = 'v1',
    method = 'post',
  } = options || {}

  const instance = version === 'v1' ? weilaAxiosInstanceV1 : weilaAxiosInstanceV2

  return useMutation<T, Error, any>({
    mutationFn: (data) => {
      return instance(url, {
        data,
        method,
      })
    },
  })
}

function requestSuccessInterceptor(config: WeilaRequestConfig) {
  const { access_token, app_id, app_sign } = useAuthStore()

  if (config && access_token) {
    config.params = {
      ...config.params,
      'app_id': app_id,
      'access-token': access_token,
      'et': String(et.value),
      'sign': app_sign,
    }
  }

  return config
}

function requestSuccessInterceptorV2(config: WeilaRequestConfigV2) {
  const { access_token, app_id, app_sign_v2 } = useAuthStore()

  if (config && access_token) {
    config.params = {
      appid: app_id,
      token: access_token,
      et: String(et.value),
      sign: app_sign_v2,
      ...config.params,
    }
  }

  return config
}

function responseSuccessInterceptor(response: AxiosResponse<WeilaRes<unknown>>) {
  const { logout } = useAuthStore()
  const weilaResponse = response.data
  const { errcode: weilaErrorCode, errmsg: weilaErrmsg, code: weilaCode } = weilaResponse

  if (weilaErrorCode === WeilaErrorCode.SUCCESS || weilaCode === 200) {
    const weilaData = weilaResponse?.data

    if (!weilaData)
      return weilaResponse

    if (!isObject(weilaData))
      return weilaData

    const keys = objectKeys(weilaData)

    return keys.length === 1
      ? weilaData[keys[0]]
      : weilaData
  }
  else if (
    weilaLogoutErrorCodes
      .findIndex(i => weilaErrorCode === i) >= 0
  ) {
    logout()
  }
  else {
    const { errcode, errmsg } = weilaResponse

    toast({
      title: `Oops: ${weilaErrorCode}`,
      description: `${weilaErrmsg}`,
    })

    throw new Error(`${errcode} ${errmsg}`)
  }
}

function errorInterceptor(error: any) {
  toast({
    title: `Oops`,
    description: `${String(error)}`,
  })
  return Promise.reject(error)
}

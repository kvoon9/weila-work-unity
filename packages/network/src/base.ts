import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { ofetch } from 'ofetch'

export const noop = () => void 0

export enum WeilaErrorCode {
  SUCCESS = 0,
  TOKEN_INVALID = 31,
  USER_IS_NOT_REGIST_CORP = 45016,
}

export const weilaLogoutErrorCodes = [
  WeilaErrorCode.TOKEN_INVALID,
]

export interface WeilaRes<T = undefined> {
  data?: T

  errmsg: string
  errcode: number

  code?: number
  msg?: string
}

export interface CreateWeilaApiOptions {
  baseURL?: string
  options?: () => Record<string, any>
  onError?: (error: Error | { errcode: number, errmsg: string }) => any
  onLogout?: () => void
}

export function createFetch(opts?: CreateWeilaApiOptions) {
  const {
    baseURL = '/v1',
    onError,
    onLogout = noop,
    options = () => ({}),
  } = opts || {}

  return ofetch.create({
    baseURL,
    timeout: 20 * 1000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    onRequest({ options: _options }) {
      _options.query = {
        ..._options.query,
        ...options(),
      }
    },
    onResponse({ response }) {
      const { errcode, errmsg } = response._data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS) {
        response._data = response._data.data
      }
      else if (weilaLogoutErrorCodes.findIndex(i => errcode === i) >= 0) {
        onLogout()
      }
      else {
        if (onError)
          onError({ errcode, errmsg })
        else
          throw new Error(`${errcode}: ${errmsg}`)
      }
    },
    onRequestError(reqError) {
      console.error('reqError', reqError)
    },
    onResponseError({ error }) {
      console.error('resError', error)
    },
  })
}

export interface WeilaRequestInstance extends AxiosInstance {
  post: <T = any, R = WeilaRes<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}

export function createRequest(opts?: CreateWeilaApiOptions) {
  const {
    baseURL = '/v1',
    onError,
    onLogout = noop,
    options = () => ({}),
  } = opts || {}

  const request: WeilaRequestInstance = axios.create({
    baseURL,
    timeout: 20 * 1000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  request.interceptors.request.use(
    (config) => {
      if (config) {
        config.params = {
          ...config.params,
          ...options,
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  request.interceptors.response.use(
    // @ts-expect-error type error
    (response: AxiosResponse<WeilaRes>) => {
      const { errcode, code } = response.data

      if (errcode === WeilaErrorCode.SUCCESS || code === 200) {
        return response.data
      }
      else if (
        weilaLogoutErrorCodes
          .findIndex(i => errcode === i) >= 0
      ) {
        onLogout()
      }
      else {
        const { errcode, errmsg } = response.data

        onError?.({ errcode, errmsg })

        throw new Error(`${errcode} ${errmsg}`)
      }
    },
    (error: Error) => {
      onError?.(error)
      return Promise.reject(error)
    },
  )

  return request
}

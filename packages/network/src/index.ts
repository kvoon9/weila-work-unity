import { ofetch } from 'ofetch'

const noop = () => void 0

export enum WeilaErrorCode {
  SUCCESS = 0,
  TOKEN_INVALID = 31,
  USER_IS_NOT_REGIST_CORP = 45016,
}

export const weilaLogoutErrorCodes = [
  WeilaErrorCode.TOKEN_INVALID,
]

export interface WeilaRes {
  errcode: number
  errmsg: string
  data?: any
}

export interface CreateWeilaFetchOptions {
  baseURL?: string
  options?: () => Record<string, any>
  onError?: (error: Error | { errcode: number, errmsg: string }) => any
  onLogout?: () => void
}

export function createFetch(opts?: CreateWeilaFetchOptions) {
  const {
    baseURL = '/v1',
    onError = noop,
    onLogout = noop,
    options = () => ({}),
  } = opts || {}

  return ofetch.create({
    baseURL,
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
        onError({ errcode, errmsg })
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

export * from './weilaFetchV2'

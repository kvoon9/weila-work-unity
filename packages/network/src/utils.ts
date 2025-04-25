import type { CreateWeilaApiOptions, WeilaRequestInstance, WeilaRes } from './types'
import axios from 'axios'
import { ofetch } from 'ofetch'
import { noop, WeilaErrorCode, weilaLogoutErrorCodes } from './constant'

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
      onError?.(reqError.error)
      console.error('reqError')
    },
    onResponseError({ error, response }) {
      if (error) {
        onError?.(error)
        console.error('resError', error)
      }
      else {
        const errcode = response.status
        const errmsg = response.statusText
        onError?.({ errcode, errmsg })
        console.error('resError', errcode, errmsg)
      }
    },
  })
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
          ...options(),
        }
      }
      return config
    },
    (error) => {
      onError?.(error)
      console.error('reqError', error)
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
      console.error('resError', error)
    },
  )

  return request
}

import weilaApiList from '../../generated/mock/weila'
import weilaExtraApiList from '../../generated/mock/weila-extra'

export interface WeilaRes<T = undefined> {
  data?: T

  errmsg: string
  errcode: number

  code?: number
  msg?: string
}

const config = {
  baseURL: '/v1',
  timeout: import.meta.env.DEV
    ? 20 * 1000
    : 5 * 1000,
  method: 'POST',
} as const

export enum WeilaErrorCode {
  SUCCESS = 0,
  TOKEN_INVALID = 31,
  USER_IS_NOT_REGIST_CORP = 45016,
}

export const weilaLogoutErrorCodes = [
  WeilaErrorCode.TOKEN_INVALID,
  WeilaErrorCode.USER_IS_NOT_REGIST_CORP,
]

export type WeilaApiUrl = typeof weilaApiList[number]['url'] | typeof weilaExtraApiList[number]['url']
export type WeilaApiUrlShort = WeilaApiUrl extends `${typeof config.baseURL}${infer Suffix}` ? Suffix : never

function noBaseUrl(url: WeilaApiUrl): WeilaApiUrlShort {
  return (url.startsWith(config.baseURL)
    ? url.slice(config.baseURL.length)
    : url) as WeilaApiUrlShort
}

export const weilaApiFullUrl = {
  ...Object.fromEntries(weilaApiList.map(api => [api.url, api.url])),
  ...Object.fromEntries(weilaExtraApiList.map(api => [api.url, api.url])),
} as Record<WeilaApiUrl, WeilaApiUrl>

export function weilaApiUrl(key: WeilaApiUrlShort) {
  return ({
    ...Object.fromEntries(weilaApiList.map(api => [api.url, api.url].map(noBaseUrl))),
    ...Object.fromEntries(weilaExtraApiList.map(api => [api.url, api.url].map(noBaseUrl))),
  } as Record<WeilaApiUrlShort, WeilaApiUrlShort>)[key] || key
}

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

export function isPublicApi(url: string) {
  return Boolean(publicApi.find(i => url.includes(i)))
}

export default config

import type { CreateWeilaApiOptions, WeilaRes } from '@weila/network'
import { createWeilaFetchV1, noop } from '@weila/network'

function useBaseURL(base: string, proxy: string) {
  if (import.meta.dev)
    return proxy

  return base
}

const options: CreateWeilaApiOptions = {
  onError(error) {
    if (error instanceof Error)
      throw error

    const { errcode, errmsg } = error as WeilaRes

    console.error(`${errcode} ${errmsg}`)
    throw new Error(`${errcode} ${errmsg}`)
  },

  onLogout: noop,
}

export const $v1 = createWeilaFetchV1({
  baseURL: useBaseURL('/v1', '/proxy'),
  ...options,
})

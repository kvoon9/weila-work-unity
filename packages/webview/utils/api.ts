import type { CreateWeilaApiOptions, WeilaRes } from '@weila/network'
import { createWeilaFetchV1, createWeilaFetchV2, createWeilaRequestV1, createWeilaRequestV2 } from '@weila/network'
import { useBaseURL } from '~/plugins/api'

const options: CreateWeilaApiOptions = {
  onError(error) {
    const { toast } = useToast()

    if (error instanceof Error)
      throw error

    const { errcode, errmsg } = error as WeilaRes

    console.error(`${errcode} ${errmsg}`)
    toast({
      title: `Oops: ${errcode}`,
      description: `${errmsg}`,
    })
    throw new Error(`${errcode} ${errmsg}`)
  },

  onLogout() {
    const { logout } = useAuthStore()
    logout()
  },
}

export const $v1 = createWeilaFetchV1({
  baseURL: useBaseURL('v1', 'proxy'),
  ...options,
})

export const $v2 = createWeilaFetchV2({
  baseURL: useBaseURL('v2', 'proxy2'),
  ...options,
})

export const $weilaRequestV1 = createWeilaRequestV1({
  baseURL: useBaseURL('v1', 'proxy'),
  ...options,
})

export const $weilaRequestV2 = createWeilaRequestV2({
  baseURL: useBaseURL('v2', 'proxy2'),
  ...options,
})

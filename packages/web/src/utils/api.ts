import type { CreateWeilaApiOptions } from '@weila/network'
import { Message } from '@arco-design/web-vue'
import { createWeilaFetchV1, createWeilaRequestV2 } from '@weila/network'
import { useAuthStore } from '~/stores/auth'

const options: CreateWeilaApiOptions = {
  onError(error) {
    if (error instanceof Error) {
      Message.error(error.message)
    }
    else {
      const { errcode, errmsg } = error
      if (errcode !== undefined && errmsg !== undefined) {
        Message.error(`${errcode}: ${errmsg}`)
      }
      else {
        console.error(error)
      }
    }
  },
  onLogout() {
    const { logout } = useAuthStore()

    logout()
  },
}

export const weilaFetch = createWeilaFetchV1({
  baseURL: '/v1',
  ...options,
})

export const $weilaRequestV2 = createWeilaRequestV2({
  baseURL: '/v2',
  ...options,
})

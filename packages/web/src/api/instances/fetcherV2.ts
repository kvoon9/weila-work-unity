import { Message } from '@arco-design/web-vue'
import { createWeilaFetchV2 } from '@weila/network'
import { useAuthStore } from '~/stores/auth'

export const $v2 = createWeilaFetchV2({
  baseURL: 'v2',
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
})

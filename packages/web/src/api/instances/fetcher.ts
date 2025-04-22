import { Message } from '@arco-design/web-vue'
import { createWeilaFetchV1 } from '@weila/network'
import { useAuthStore } from '~/stores/auth'

export const weilaFetch = createWeilaFetchV1({
  baseURL: 'v1',
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

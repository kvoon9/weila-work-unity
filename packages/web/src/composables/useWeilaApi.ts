import Message from '@arco-design/web-vue/es/message'
import { WeilaApi } from '@wl/network'
import { shallowRef } from 'vue'

export function useWeilaApi() {
  const weilaApi = shallowRef(new WeilaApi(
    '102036',
    'b3c658bd2e637c65efb134fb381d4a18',
    {
      baseURL: 'v1',
      onError(error: any) {
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
      onAuthError() {
        const router = useRouter()
        localStorage.setItem('token', '')
        // localStorage.clear()
        router.push('/login')
      },
    },
  ))

  return weilaApi
}

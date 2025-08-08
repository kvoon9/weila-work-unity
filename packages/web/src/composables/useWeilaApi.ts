import Message from '@arco-design/web-vue/es/message'
import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { shallowRef } from 'vue'

export function useWeilaApi() {
  const baseURL = `${getRootUrl(window.location.href)}/v2`

  const weilaApi = shallowRef(new WeilaApi(
    '102036',
    'b3c658bd2e637c65efb134fb381d4a18',
    { baseURL },
  ))

  weilaApi.value.hook('request:error', onError)
  weilaApi.value.hook('response:error', onError)

  weilaApi.value.hook('auth:error', () => {
    localStorage.setItem('token', '')
    window.location.reload()
  })
  return weilaApi
}

function onError(error: any) {
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
}

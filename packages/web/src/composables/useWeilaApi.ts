import type { AuthModel } from '~/stores/auth'
import Message from '@arco-design/web-vue/es/message'
import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { shallowRef } from 'vue'

let isRefreshing = shallowRef(false)

export function useWeilaApi() {
  const baseURL = `${getRootUrl(window.location.href)}/v2`

  const weilaApi = shallowRef(new WeilaApi(
    '102036',
    'b3c658bd2e637c65efb134fb381d4a18',
    { baseURL },
  ))

  weilaApi.value.hook('request:prepare', async (ctx) => {
    // const url = ctx.request as string
    // const isPublic = ['login', 'common'].some(i => url.includes(i))
    // const isNeedRefresh = needRefresh()
    // if (!isPublic && isNeedRefresh) {
    //   if(isRefreshing.value) {
    //     return new Promise((resolve) => {
    //       watchOnce(isRefreshing, (value) => {

    //       })
    //     })
    //   }

    //   return refreshToken()
    // }
  })

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

function needRefresh() {
  const { loginTime, expiresIn } = useAuthStore()
  const expireTime = loginTime + expiresIn * 1000
  const now = Date.now()
  const SAFE_GAP = 60 * 1000
  const res = expireTime - now <= SAFE_GAP
  return res
}

async function refreshToken() {
  const { token, refreshToken, expiresIn, loginTime } = storeToRefs(useAuthStore())

  isRefreshing.value = true
  try {
    const auth: AuthModel = await useWeilaApi().value.v2.fetch('corp/auth/refresh', {
      body: { refresh_token: refreshToken.value },
    })

    token.value = auth.access_token
    refreshToken.value = auth.refresh_token
    expiresIn.value = auth.expires_in
    loginTime.value = Date.now()
  }
  finally {
    isRefreshing.value = false
  }
}

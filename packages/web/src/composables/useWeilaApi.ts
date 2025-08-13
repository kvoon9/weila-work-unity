import Message from '@arco-design/web-vue/es/message'
import { getRootUrl } from '@kvoon/utils'
import { getOptionsV2 } from '@weila/network'
import { WeilaApi } from '@wl/network'
import { stringifyQuery } from 'ufo'
import { shallowRef } from 'vue'

let refreshing: Promise<any> | null = null

export function useWeilaApi() {
  const baseURL = `${getRootUrl(window.location.href)}/v2`

  const weilaApi = shallowRef(new WeilaApi(
    '102036',
    'b3c658bd2e637c65efb134fb381d4a18',
    { baseURL },
  ))

  weilaApi.value.hook('request:prepare', async (ctx) => {
    const { needRefresh } = useAuthStore()
    const { refreshToken, token, expiresIn, loginTime } = storeToRefs(useAuthStore())

    const url = ctx.request as string
    const isPublic = ['login', 'common'].some(i => url.includes(i))
    const isNeedRefresh = needRefresh()

    if (!isPublic && isNeedRefresh) {
      if (!refreshing) {
        refreshing = fetch(`/v2/corp/auth/refresh?${stringifyQuery(getOptionsV2())}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken.value }),
        })
          .then(res => res.json())
          .then(({ data: auth }: { data: AuthModel }) => {
            token.value = auth.access_token
            refreshToken.value = auth.refresh_token
            expiresIn.value = auth.expires_in
            loginTime.value = Date.now()
            return auth
          })
      }

      return refreshing
    }
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

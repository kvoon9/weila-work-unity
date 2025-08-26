<script lang="ts" setup>
import en from '@arco-design/web-vue/es/locale/lang/en-us'
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn'
import Message from '@arco-design/web-vue/es/message'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { getOptionsV2 } from '@weila/network'
import { stringifyQuery } from 'ufo'
import { computed } from 'vue'

const { locale } = useI18n()

const arcoLang = computed(() => ({
  'zh-CN': zhCN,
  en,
}[locale.value]))

const { outdated, update } = useBundleInfo()

watchEffect(() => outdated.value && window.location.reload())

onBeforeRouteUpdate(() => {
  update()
})

const router = useRouter()

let refreshing: Promise<any> | null = null

const weilaApi = useWeilaApi()

weilaApi.value.hook('request:prepare', async (ctx) => {
  const { needRefresh } = useAuthStore()
  const { refreshToken, token, expiresIn, loginTime } = storeToRefs(useAuthStore())

  const clean = (reason?: any) => {
    console.error('clean reason', reason)
    token.value = ''
    refreshToken.value = ''
    expiresIn.value = -1
    loginTime.value = -1
    // window.location.reload()
  }

  try {
    const url = (ctx?.request || ctx?.url) || '' as string
    const isPublic = ['login', 'common'].some(i => url.includes(i))
    const isNeedRefresh = needRefresh()

    console.log('isPublic', isPublic)
    console.log('isNeedRefresh', isNeedRefresh)

    if (isPublic || !isNeedRefresh)
      return

    if (!refreshing) {
      refreshing = fetch(`/v2/corp/auth/refresh?${stringifyQuery(getOptionsV2())}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken.value }),
      })
        .then((res) => {
          if (!res.ok)
            throw new Error('refresh token failed')

          return res.json()
        })
        .then(({ data: auth, errcode }: { data: AuthModel, errcode: number }) => {
          if (errcode === 31) {
            router.push('/login')
            return
          }

          token.value = auth.access_token
          refreshToken.value = auth.refresh_token
          expiresIn.value = auth.expires_in
          loginTime.value = Date.now()
          return auth
        })
        .catch((error) => {
          console.error('error', error)
          clean()
        })
    }

    return refreshing
  }
  catch (error) {
    console.error('error', error)
    console.error('ctx', ctx)
    clean()
  }
})
weilaApi.value.hook('request:error', onError)
weilaApi.value.hook('response:error', onError)

weilaApi.value.hook('auth:error', () => {
  localStorage.setItem('token', '')
  window.location.reload()
})
function onError(error: any) {
  console.error('error', error)
  if (error instanceof Error) {
    Message.error(error.message)
  }
  else {
    const { errcode, errmsg } = error
    if (errcode !== undefined && errmsg !== undefined)
      Message.error(`${errcode}: ${errmsg}`)
  }
}
</script>

<template>
  <a-config-provider :locale="arcoLang">
    <router-view />
    <VueQueryDevtools />
  </a-config-provider>
</template>

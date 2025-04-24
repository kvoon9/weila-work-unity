import type { LoginModel, RefreshModel } from 'generated/mock/weila'
import CryptoJS from 'crypto-js'
import md5 from 'md5'

import { ENCRYPTION_KEY } from '~/shared/const'
import { et, timestamp } from '~/shared/states'
import { $weilaPublicRequest } from '~/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const EXPIRES_BUFFER = 1000 * 60 * 60 * 12

  const app_id = '102036'
  const key = 'b3c658bd2e637c65efb134fb381d4a18'

  const app_sign = computed(() => md5(`${et.value}${key}`))
  const app_sign_v2 = computed(() => getMd5Middle8Chars(app_sign.value))

  function getMd5Middle8Chars(md5: string) {
    // 888e0f79573741ac3e1f09a3c9e46968 -> 41ac3e1f
    return md5.slice(12, 20)
  }

  const access_token = useLocalStorage('token', '')
  const refresh_token = useLocalStorage('refresh_token', '', {
    serializer: {
      read: (v: string) => {
        if (!v)
          return ''
        return CryptoJS.AES.decrypt(v, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
      },
      write: (v: string) => {
        if (!v)
          return ''
        return CryptoJS.AES.encrypt(v, ENCRYPTION_KEY).toString()
      },
    },
  })
  const expires_in = useLocalStorage('expires_in', -1)

  const last_login_time = useLocalStorage('last_login_time', -1)
  watchImmediate(access_token, token => last_login_time.value = token ? timestamp.value : -1)

  const isLogin = computed(() =>
    Boolean(access_token.value)
    && Boolean(refresh_token.value)
    && Boolean(last_login_time.value)
    && Boolean(expires_in.value),
  )

  const accountHistoryRecord = useLocalStorage('account-history-record', new Map<string, string>(), {
    serializer: {
      read: (v: string) => {
        const decrypted = CryptoJS.AES.decrypt(v, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
        return new Map(JSON.parse(decrypted))
      },
      write: (v: Map<string, string>) => {
        const jsonString = JSON.stringify(Array.from(v.entries()))
        return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
      },
    },
  })

  async function login(
    params: { account: string, password: string },
    options?: { remember?: boolean },
  ) {
    const {
      remember = false,
    } = options || {}

    const { account, password } = params

    try {
      const { data } = await $weilaPublicRequest.post<LoginModel['data']>(
        `/corp/web/login`,
        {
          account,
          password: md5(password),
        },
      )

      if (data) {
        access_token.value = data.access_token
        refresh_token.value = data.refresh_token
        expires_in.value = data.expires_in
        if (remember)
          accountHistoryRecord.value.set(account, password)
      }

      return data
    }
    catch (error) {
      console.error('login', error)
      throw error
    }
  }

  function logout() {
    access_token.value = ''
    refresh_token.value = ''
    last_login_time.value = -1
    expires_in.value = -1
    router.push('/login')
  }

  /**
   * Refresh
   */

  const isOutdate = computedWithControl(
    () => useTimestamp({ interval: 500 }).value,
    () => isLogin.value && (timestamp.value - last_login_time.value > (expires_in.value * 1000) - EXPIRES_BUFFER),
  )

  let isRefreshing = false

  const refreshToken = useThrottleFn(async () => {
    try {
      if (isRefreshing) {
        console.warn('isRefreshing')
        return
      }

      isRefreshing = true

      if (!refresh_token.value)
        throw new Error('No refresh token')
      const { errcode, data } = await weilaRequest.post<RefreshModel['data']>('/sessions/refresh', {
        refresh_token: refresh_token.value,
      })

      if (errcode !== 0)
        throw new Error('Refresh token failed')

      if (!data)
        throw new Error('No data')

      access_token.value = data.access_token
      expires_in.value = data.expires_in
      refresh_token.value = data.refresh_token
    }
    catch (error) {
      console.error('refresh token', error)
      logout()
    }
    finally {
      isRefreshing = false
    }
  }, 300)

  watchEffect(() => isOutdate.value ? refreshToken() : void 0)

  return {
    app_id,
    app_sign,
    app_sign_v2,
    access_token,
    refresh_token,
    expires_in,
    last_login_time,
    isLogin,
    isOutdate,
    accountHistoryRecord,
    login,
    logout,
  }
})

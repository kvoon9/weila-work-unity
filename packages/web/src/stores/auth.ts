import type { LoginModel } from 'generated/mock/weila'
import md5 from 'md5'
import { accountHistoryRecord } from '~/shared/const'

export interface VipInfo {
  vip: number
  vip_expired: number
  vip_created: number
  vip_supports: VipSupport[]
}

// split code
export interface VipSupport {
  member_limit?: number
  name: string
  support: boolean
  dept_limit?: number
  dept_member_limit?: number
  group_limit?: number
  group_member_limit?: number
  device_limit?: number
  type?: number
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const access_token = useLocalStorage('token', '')

  const { data: vip } = useWeilaFetch<VipInfo>('corp/org/get-my-vip')

  const isLogin = computed(() => Boolean(access_token.value))

  async function login(
    params: { account: string, password: string },
    options?: { remember?: boolean },
  ) {
    const {
      remember = false,
    } = options || {}

    const { account, password } = params

    try {
      const api = useWeilaApi()
      const data = await api.value.fetch<LoginModel['data']>('/corp/web/login', {
        body: {
          account,
          password: md5(password),
        },
      })

      if (data) {
        access_token.value = data.access_token
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
    // localStorage.clear()
    localStorage.removeItem('token')
    router.push('/login')
  }

  return {
    access_token,
    isLogin,
    login,
    logout,
    vip,
  }
})

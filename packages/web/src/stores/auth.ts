import type { LoginModel } from 'generated/mock/weila'
import type { Corp } from '~/types'
import md5 from 'md5'
import { accountHistoryRecord } from '~/shared/const'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const access_token = useLocalStorage('token', '')

  const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')

  const isVip = computed(() => corp.value)

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
    isVip,
  }
})

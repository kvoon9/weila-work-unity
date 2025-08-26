export interface AuthModel {
  access_token: string
  expires_in: number
  refresh_token: string
}

export interface VipInfo {
  vip: number
  vip_name: string
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
  quick_support?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const refreshToken = useLocalStorage('refresh_token', '')
  const token = useLocalStorage('token', '')
  const expiresIn = useLocalStorage('expires_in', 7200)
  const loginTime = useLocalStorage('login_time', 0, {})

  const { data: vip } = useWeilaFetch<VipInfo>('corp/org/get-my-vip', {}, {
    enabled: computed(() => Boolean(token.value)),
  })

  function logout() {
    localStorage.removeItem('token')
    router.push('/login')
  }

  function needRefresh() {
    const expireTime = loginTime.value + (expiresIn.value / 2) * 1000
    const now = Date.now()
    return expireTime < now
  }

  return {
    token,
    refreshToken,
    expiresIn,
    loginTime,
    logout,
    vip,
    needRefresh,
  }
})

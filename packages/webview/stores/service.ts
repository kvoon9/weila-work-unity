import { useQuery } from '@tanstack/vue-query'

export enum ServiceState {
  Uncreated = '未创建',
  Unverified = '未认证',
  Verified = '已开通',
}

export const useServiceStore = defineStore('service', () => {
  const { $v2 } = useNuxtApp()

  const { isLogin } = storeToRefs(useAuthStore())

  const serviceAccountQuery = useQuery({
    enabled: isLogin,
    queryKey: ['workbench-service-account'],
    queryFn: () => $v2<{
      business: null
    }>('corp/busi/get-my-business'),
  })

  const serviceLicenseQuery = useQuery({
    enabled: isLogin,
    queryKey: ['service-license'],
    queryFn: () => $v2<{
      license: null
    }>('corp/busi/legal/get-my-legal'),
  })

  const hasBusiness = computed(() => !!serviceAccountQuery.data.value?.business)
  const isVerified = computed(() => !!serviceLicenseQuery.data.value?.license)

  const serviceState = computed(() => {
    if (hasBusiness.value && isVerified.value)
      return ServiceState.Verified

    if (!hasBusiness.value)
      return ServiceState.Uncreated

    return ServiceState.Unverified
  })

  return {
    serviceAccountQuery,
    serviceLicenseQuery,
    hasBusiness,
    isVerified,
    serviceState,
  }
})

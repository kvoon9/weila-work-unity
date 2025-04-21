import type { LoginModel } from 'generated/mock/weila'
import { cloneDeep } from 'lodash'
import { acceptHMRUpdate, defineStore } from 'pinia'

export type Role = '' | '*' | 'admin' | 'user'

export const useUserStore = defineStore('user', () => {
  const state = ref<LoginModel['data'] | undefined>(undefined)

  const role = computed<Role>(() => '*')
  const userInfo = computed(() => cloneDeep(state.value?.user))
  const orgInfo = computed(() => cloneDeep(state.value?.org))
  const accountInfo = computed(() => cloneDeep(state.value?.account))

  return {
    role,
    userInfo,
    orgInfo,
    accountInfo,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}

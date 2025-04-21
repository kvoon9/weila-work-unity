import { objectPick } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'
import { weilaFetch } from '~/api/instances/fetcher'
import { useAuthStore } from './auth'

export interface CorpModel {
  num: number
  name: string
  avatar: string
  intro: string
  created: number
  member_cnt: number
  group_cnt: number
  group_ver: number
  address_ver: number
  device_cnt: number
  device_ver: number
}

export const useCorpStore = defineStore('corp', () => {
  const { isLogin } = storeToRefs(useAuthStore())

  const enabled = computed(() => isLogin.value)

  const query = useQuery({
    enabled,
    queryKey: ['my-org', isLogin],
    queryFn: () => weilaFetch<{ corp?: CorpModel }>(weilaApiUrl('/corp/web/org-my-org')).then(i => i.corp),
  })

  const org_num = computed(() => query.data.value?.num)

  return {
    ...objectPick(query, [
      'data',
      'isFetching',
      'isSuccess',
      'refetch',
      'isStale',
    ]),
    org_num,
  }
})

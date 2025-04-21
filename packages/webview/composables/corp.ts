import type { OrgMyOrgModel } from '~/fixture/mock'
import { objectPick } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'

export const useCorp = createSharedComposable(() => {
  const { isLogin } = storeToRefs(useAuthStore())

  const enabled = computed(() => isLogin.value)
  const { $v1 } = useNuxtApp()

  const query = useQuery({
    enabled,
    queryKey: ['my-org', isLogin],
    queryFn: () => $v1<OrgMyOrgModel['data']>(weilaApiUrl('/corp/web/org-my-org')).then(i => i.corp),
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

import type { GroupGetallModel } from '~/fixture/mock'
import { useQuery } from '@tanstack/vue-query'

export const useGroupList = createSharedComposable(() => {
  const { $v1 } = useNuxtApp()
  const { data: corp } = useCorp()

  return useQuery<GroupGetallModel['data']['groups']>({
    enabled: computed(() => typeof corp.value?.num === 'number'),
    queryKey: ['/group-getall', 'groups', corp],
    queryFn: () => $v1('/corp/web/group-getall', {
      body: { org_num: String(corp.value!.num) },
    }).then((i: any) => i.groups.sort((a: any, b: any) => b.id - a.id)),
  })
})

export function useGroup(id: string | number) {
  const { data } = useGroupList()
  return computed(() => data.value?.find(i => i.id === Number(id)))
}

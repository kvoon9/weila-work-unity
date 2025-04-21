import type { DeptGetallModel } from '~/fixture/mock'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'

export const useDeptList = createSharedComposable(() => {
  const { $v1 } = useNuxtApp()
  const { data: corp } = useCorp()

  return useQuery<DeptGetallModel['data']['depts']>({
    enabled: computed(() => Boolean(corp.value?.num)),
    queryKey: [weilaApiUrl('/corp/web/dept-getall'), corp],
    queryFn: () => $v1(weilaApiUrl('/corp/web/dept-getall'), {
      body: {
        org_num: corp.value!.num,
      },
    }).then((i: any) => i.depts.sort((a: any, b: any) => a.id - b.id)),
  })
})

export function useDept(id: MaybeRefOrGetter<number>) {
  const { data: depts } = useDeptList()

  return computed(() => depts.value?.find(dept => dept.id === toValue(id)))
}

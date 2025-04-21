import type { MemberGetallModel } from '~/fixture/mock'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'

export const useMemberList = createSharedComposable(() => {
  const { org_num } = useCorp()

  const { $v1 } = useNuxtApp()

  const res = useQuery({
    enabled: computed(() => Boolean(org_num.value)),
    queryKey: [weilaApiUrl('/corp/web/member-getall'), org_num],
    queryFn: () => $v1<MemberGetallModel['data']>(
      weilaApiUrl('/corp/web/member-getall'),
      {
        body: {
          org_num: org_num.value,
        },
      },
    )
      .then((i) => {
        return i.members.map((i) => {
          let weight = 0

          if (i.type === 255)
            weight += 9999

          // if (i.type === 1)
          //   weight += 1

          if (i.online)
            weight += 1

          if (i.dept_id === 0)
            weight += 1

          return {
            ...i,
            weight,
          }
        }).sort((a, b) => b.weight - a.weight)
      }),
  })

  const members = computed(() => res.data.value)

  const devices = computed(() => res.data.value)

  return {
    ...res,
    data: res.data,
    members,
    devices,
  }
})

export function useMember(id: Ref<number>) {
  const { data } = useMemberList()

  return computed(() => data.value?.find(i =>
    i.user_id === Number(id?.value),
  ))
}

export function useDevice(id: Ref<number>) {
  const { devices } = useMemberList()

  return computed(() => devices.value?.find(i =>
    i.user_id === Number(id?.value),
  ))
}

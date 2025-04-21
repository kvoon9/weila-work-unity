import type { MemberChangeStateModel } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'

export function useStateToggle() {
  const { $v1 } = useNuxtApp()
  const { org_num } = useCorp()

  return useMutation({
    mutationFn: async (payload: { member_id: number, state: 0 | 1 }) => await $v1<MemberChangeStateModel['data']>(weilaApiUrl('/corp/web/member-change-state'), {
      body: {
        org_num: org_num.value,
        member_id: payload.member_id,
        state: payload.state ? 0 : 1,
      },
    }),
  })
}

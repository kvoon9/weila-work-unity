import type { ContactModel } from '~/api/contact'
import { objectPick } from '@antfu/utils'
import { useQuery } from '@tanstack/vue-query'
import { weilaFetch } from '~/api/instances/fetcher'
import { useAuthStore } from './auth'

export const useContactStore = defineStore('contact', () => {
  const corpStore = useCorpStore()
  const { isLogin } = storeToRefs(useAuthStore())
  const { org_num } = storeToRefs(corpStore)
  const enabled = computed(() =>
    isLogin.value
    && typeof org_num.value === 'number',
  )

  const query = useQuery({
    enabled,
    queryKey: ['contact', org_num],
    queryFn: () => (weilaFetch<ContactModel>(
      '/corp/web/get-address-list',
      { body: { org_num: org_num.value } },
    )
      .then(i => i.address_list))
      .then((contact) => {
        return {
          ...contact,
          members: contact.members.map(member => ({
            ...member,
            id: member.user_id,
          })),
          depts: contact.depts.map(dept => ({
            ...dept,
            members: dept.members.map(member => ({
              ...member,
              id: member.user_id,
            })),
          })),
        }
      }),
  })

  function findMemberById(_id: string | number) {
    const id = Number(_id)
    if (!query.data.value)
      return undefined

    let member = query.data.value.members.find(member => member.id === id)

    if (!member) {
      query.data.value.depts.forEach((dept) => {
        member = dept.members.find(member => member.id === id)
      })
    }

    return member
  }

  return {
    ...objectPick(query, [
      'data',
      'isPending',
      'refetch',
    ]),
    findMemberById,
  }
})

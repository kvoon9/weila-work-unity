<script setup lang="ts">
import type { Corp } from '~/types'
import { useQuery } from '@tanstack/vue-query'
import { UseImage } from '@vueuse/components'
import { RouterLink } from 'vue-router'
import { weilaApiUrl } from '~/api'

definePage({
  meta: {
    menu: {
      label: 'menu.message',
      icon: 'icon-message',
      order: 0,
    },
  },
})

interface GroupModel {
  id: number
  name: string
  avatar: string
  creator: number
  type: number
  user_count: number
  member_version: number
  burst_mode: number
  shutup: number
  created: number
}

const route = useRoute('/message/[group_id]-[group_name]')
// const router = useRouter()

const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')

const { data: groups } = useQuery<GroupModel[]>({
  enabled: computed(() => Boolean(corp.value)),
  queryKey: ['groups', weilaApiUrl('/corp/web/group-getall'), corp],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/group-getall'), {
    body: { org_num: String(corp.value!.num) },
  }).then(i => i.groups),
})

// const defaultSelectedKeys = ref<number[]>([groups.value?.[0].id || -1])
// const selectedKeys = ref<number[]>(defaultSelectedKeys.value)

// TODO: use radix vue's listbox
// const fruits = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']
// const vegetables = ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek']
</script>

<template>
  <div h-full flex>
    <section relative h-full w80 p2 bg-base>
      <a-empty v-if="!groups?.length" absolute position-center />
      <RouterLink
        v-for="group in groups" :key="group.id" :to="`/message/${group.id}-${group.name}`"
        class="flex items-center gap-2 list-btn" :class="route.params.group_id && group.id === Number(route.params.group_id)
          ? 'bg-gray-100 dark:bg-dark-2'
          : ''
        "
      >
        <UseImage :src="group.avatar" class="mr-4 h-12 w-12 rounded-full" alt="Group Avatar">
          <template #loading>
            <div class="mr-4 h-12 w-12 animate-pulse rounded-full bg-gray-200" />
          </template>
          <template #error>
            <div class="mr-4 h-12 w-12 flex items-center justify-center rounded-full bg-gray-300">
              <span class="text-xs text-gray-500">Error</span>
            </div>
          </template>
        </UseImage>
        <span
          :class="route.params.group_id && group.id === Number(route.params.group_id)
            ? 'color-primary '
            : ''
          "
        >{{ group.name }}</span>
      </RouterLink>
    </section>
    <section relative h-full w-full>
      <RouterView />
    </section>
  </div>
</template>

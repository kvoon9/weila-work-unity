<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { UseImage } from '@vueuse/components'
import { weilaFetch } from '~/api/instances/fetcher'

const { t } = useI18n()

// definePage({
//   meta: {
//     menu: {
//       label: 'menu.me',
//       order: 3,
//       icon: 'icon-user',
//     },
//   },
// })

interface User {
  id: number
  num: string
  sex: number
  name: string
  bind_phone: string
  country_code: string
  avatar: string
}

const router = useRouter()

const { data } = useQuery({
  queryKey: ['user'],
  queryFn: () => weilaFetch<{ user: User }>('/corp/web/user-selfinfo').then(({ user }) => user),
})

$inspect(data)

const editUserInfoModalState = reactive({
  visible: false,
})
</script>

<template>
  <div class="w-full p2">
    <a-breadcrumb mb4>
      <RouterLink to="/me">
        <a-breadcrumb-item>{{ t('breadcrumb.me') }}</a-breadcrumb-item>
      </RouterLink>
    </a-breadcrumb>
    <div v-if="data" class="mx-auto w-fit rounded-lg p-6 shadow-md transition-colors duration-200 bg-base">
      <div flex justify-between>
        <div class="mb-6 w-full items-center justify-center" flex="~ col">
          <UseImage :src="data.avatar" :alt="data.name" class="mb-2 h-20 w-20 rounded-full object-cover">
            <template #loading>
              <div class="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
            </template>
            <template #error>
              <div class="h-20 w-20 flex items-center justify-center rounded-full bg-gray-300">
                <i i-carbon-account class="text-3xl text-gray-500" />
              </div>
            </template>
          </UseImage>
          <div>
            <h2 class="text-2xl text-gray-800 font-semibold dark:text-white">
              {{ data.name }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              {{ t('weila-number') }}: {{ data.num }}
            </p>
          </div>
        </div>
        <a-modal
          v-model:visible="editUserInfoModalState.visible" title="Edit User Infomation"
          @before-ok="() => void 0"
        />
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <p><span class="font-medium">{{ t('user.gender') }}:</span> {{ data.sex === 0 ? t('male') : t('famale') }}</p>
        <p>
          <span class="font-medium">{{ t('user.phone') }}:</span> +{{ data.country_code }} {{ data.bind_phone }}
          <a-button inline-flex size="small" @click="router.push('/me/binding-phone')">
            <template #icon>
              <i i-ph-pen />
            </template>
          </a-button>
        </p>
        <p class="mt-4">
          <EditSelfPasswordModal />
        </p>
      </div>
    </div>
    <div v-else class="rounded-lg bg-white p-6 text-center text-gray-600 shadow-md dark:bg-gray-800 dark:text-gray-300">
      Loading user information...
    </div>
  </div>
</template>

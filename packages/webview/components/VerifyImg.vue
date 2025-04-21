<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { UseImage } from '@vueuse/components'
import { headers } from '~/shared/const'
import { $inspect } from '~/utils/inspect'

const { data: src, refetch, error } = useQuery({
  queryKey: ['verifyCodeImg'],
  refetchOnWindowFocus: false,
  queryFn: async () => {
    const { $weilaFetch } = useNuxtApp()
    const blob: Blob = await $weilaFetch<any>('/corp/web/get-verifycode-image?width=150&height=50', {
      method: 'get',
      responseType: 'blob',
      headers,
    })
    const src = URL.createObjectURL(blob)
    return src
  },
})

$inspect(src, error)

defineExpose({
  refetch,
})
</script>

<template>
  <div>
    <UseImage v-if="src" :src="src" class="cursor-pointer" alt="verify code" @click="() => refetch()">
      <template #loading>
        <div class="h-full w-full flex items-center justify-center">
          <i class="i-carbon-progress-bar-round text-2xl text-gray-500" />
        </div>
      </template>

      <template #error>
        <div class="h-full w-full flex items-center justify-center">
          <i class="i-carbon-no-image text-2xl text-red-500" />
        </div>
      </template>
    </UseImage>
    <div v-else class="h-full w-full flex items-center justify-center" @click="() => refetch()">
      <i class="i-carbon-no-image text-2xl text-gray-500" />
    </div>
  </div>
</template>

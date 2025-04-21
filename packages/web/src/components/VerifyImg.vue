<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { UseImage } from '@vueuse/components'
import { verifyImgFetcher } from '~/api/verify-img'

const { data: src, refetch, error } = useQuery({
  queryKey: ['verifyCodeImg'],
  refetchOnWindowFocus: false,
  queryFn: verifyImgFetcher,
})

$inspect(src, error)

defineExpose({
  refetch,
})
</script>

<template>
  <div @click="() => refetch()">
    <UseImage v-if="src" :src="src" class="cursor-pointer" alt="verify code">
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
    <div v-else class="h-full w-full flex items-center justify-center">
      <i class="i-carbon-no-image text-2xl text-gray-500" />
    </div>
  </div>
</template>

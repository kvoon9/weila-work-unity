<script setup lang="ts">
import { shallowRef } from 'vue'

const router = useRouter()
const isDark = shallowRef(false)
</script>

<template>
  <div class="min-h-screen transition-colors duration-300" :class="isDark ? 'dark bg-gray-900' : 'bg-gray-50'">
    <div class="mx-auto px-4 py-8 container">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-2xl font-bold" :class="isDark ? 'text-white' : 'text-gray-800'">
          Weila Content
        </h1>
      </div>

      <div class="grid gap-4">
        <NuxtLink
          v-for="route in router.getRoutes().filter(route => route.path !== '/')"
          :key="route.path"
          :to="route.path"
          class="cursor-pointer rounded-lg p-4 transition-all duration-200 hover:scale-102"
          :class="isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'"
        >
          <div class="flex items-center gap-2">
            <div class="i-carbon-route text-lg" />
            <span class="font-mono">{{ route.path }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

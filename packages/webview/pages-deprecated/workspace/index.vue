<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  name: '工作台',
})
</script>

<template>
  <div class="flex flex-1 flex-col gap-4 ">
    <div class="grid auto-rows-min gap-4 md:grid-cols-3">
      <NuxtLink to="/workspace/user-track" class="aspect-video rounded-xl bg-muted/50 flex items-center justify-center opacity-85 hover:opacity-100">
        <div>
          <LucideMapPinned class="mx-auto size-16 color-gray-500" style="color: gray" />
          <span class="text-gray-600 text-2xl font-semibold">
            用户轨迹
          </span>
        </div>
      </NuxtLink>
      <div class="aspect-video rounded-xl bg-muted/50" />
      <div class="aspect-video rounded-xl bg-muted/50" />
    </div>
    <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
  </div>
</template>

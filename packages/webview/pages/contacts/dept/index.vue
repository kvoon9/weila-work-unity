<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'

const { data: _data } = useDeptList()
const search = useRouteQuery('q', '')

const data = computed(() => {
  return _data.value?.filter(dept => dept.name.includes(search.value))
})
</script>

<template>
  <div class="grid gap-4 p-4">
    <div flex="~ items-center" border rounded-lg p1 bg-white drop-shadow>
      <input v-model="search" type="text" placeholder="部门名称" class="grow-1 p-2" focus:outline-none>
      <Icon v-if="search" name="ph:x" :disabled="!search" size-4 mx2 @click="search = ''" />
    </div>
    <div grid="~ cols-2 gap-2">
      <NuxtLink to="/contacts/dept/create" col-span-1 grow-1 text-center btn-primary space-x-2>
        <Icon name="ph:folder-user" />
        <span>创建部门</span>
      </NuxtLink>
    </div>
    <Empty v-if="data?.length === 0" />
    <NuxtLink
      v-for="dept in data"
      :key="dept.id"
      :to="`/contacts/dept/${dept.id}`"
      class="rounded-lg border p-4 "
      flex="~ justify-between items-center"
      :class="{
        'border-primary-300 bg-primary-100/12': search,
      }"
      drop-shadow-xl drop-shadow-color-neutral:10 bg-white
    >
      <div font-semibold>
        {{ dept.name }}
      </div>
      <div text-sm color-neutral-500>
        人数 {{ dept.user_count || 0 }}
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { burstModeOptions } from '~/shared/const'

const search = useRouteQuery('q', '')

const { data: _groups } = useGroupList()

const groups = computed(() =>
  _groups.value?.filter(group => group.name.includes(search.value)),
)
</script>

<template>
  <div class="grid gap-4 p-4">
    <div flex="~ items-center" border rounded-lg p1 bg-white drop-shadow>
      <input v-model="search" type="text" placeholder="群组名称" class="grow-1 p-2" focus:outline-none>
      <Icon v-if="search" name="ph:x" :disabled="!search" size-4 mx2 @click="search = ''" />
    </div>
    <div grid="~ cols-2 gap-2">
      <NuxtLink to="/contacts/group/create" col-span-1 grow-1 text-center btn-primary space-x-2>
        <Icon name="ph:users" />
        <span>创建群组</span>
      </NuxtLink>
    </div>
    <Empty v-if="groups?.length === 0" />
    <NuxtLink
      v-for="group in groups" :key="group.id" :to="`/contacts/group/${group.id}`" flex="~ items-center justify-between" class="rounded-lg p-4 space-y-2" border
      :class="{
        'border-primary-300 bg-primary-100/12': search,
      }"
      bg-white drop-shadow-xl drop-shadow-color-neutral:10
    >
      <div flex items-center space-x-2>
        <img :src="group.avatar || ''" :alt="group.name" class="w-12 h-12 rounded-full">
        <div>
          <div font-semibold space-x-2>
            <span> {{ group.name }} </span>
          </div>
          <span w-fit font-normal text-sm border="1 primary" px1 rounded color-primary-400>
            {{ burstModeOptions.find(option => option.value === group.burst_mode)?.label }}
          </span>
        </div>
      </div>
      <div class="text-sm text-gray-500">
        人数 {{ group.user_count }}
      </div>
    </NuxtLink>
  </div>
</template>

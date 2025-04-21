<script setup lang="ts" generic="T">
import type { Item } from '.'
import clsx from 'clsx'

defineProps<{
  name: string
  items: Item<T>[]
  class?: string | string[]
}>()

const value = defineModel<T | null>('value', { default: null })

function check(to: T) {
  if (value.value === to)
    value.value = null
  else
    value.value = to
}
</script>

<template>
  <Popover>
    <PopoverTrigger :class="clsx('flex items-center space-x-2 min-w-[50px]', $props?.class)">
      {{ name }} <Icon name="ph:list-bold" />
    </PopoverTrigger>
    <PopoverContent class="w-fit">
      <ul class="space-y-4">
        <li v-for="item in items" :key="String(item.value)" class="flex items-center gap-2">
          <Checkbox
            :id="String(item.value)"
            :checked="value === item.value"
            @update:checked="check(item.value)"
          />
          <label :for="String(item.value)">
            {{ item.name }}
          </label>
        </li>
      </ul>
    </PopoverContent>
  </Popover>
</template>

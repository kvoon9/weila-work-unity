<script setup lang="ts">
defineProps<{
  label: string
  name: string
  attrs: Record<string, any>
}>()

const modelValue = defineModel<0 | 1 | undefined>({ required: true })
</script>

<template>
  <div space-x-2 border p4 rounded bg-secondary bg-op50>
    <div flex="~ items-center justify-between">
      <label label :for="name">{{ label }}</label>
      <input v-bind="attrs" v-model="modelValue" checkbox type="checkbox" :true-value="1" :false-value="0" :name="name">
    </div>
  </div>
</template>

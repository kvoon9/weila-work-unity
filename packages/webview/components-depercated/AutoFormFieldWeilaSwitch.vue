<script setup lang="ts">
import type { FieldProps } from './ui/auto-form/interface'
import { AutoFormLabel } from './ui/auto-form'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from './ui/form'

defineProps<FieldProps>()
</script>

<template>
  <FormField v-slot="{ value, handleChange }" :name="fieldName">
    <FormItem v-bind="$attrs" class="flex flex-row items-center justify-between rounded-lg border p-4">
      <AutoFormLabel v-if="!config?.hideLabel">
        {{ config?.label }}
      </AutoFormLabel>
      <FormControl>
        <Switch
          :checked="Boolean(value)"
          aria-readonly
          @update:checked="() => handleChange(value ? 0 : 1)"
        />
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>

<script setup lang="ts">
import type { FieldProps } from './ui/auto-form/interface'
import { AutoFormLabel } from './ui/auto-form'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from './ui/form'

defineProps<FieldProps>()
</script>

<template>
  <FormField v-slot="{ componentField }" :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel">
        {{ config?.label }}
      </AutoFormLabel>
      <FormControl>
        <!-- @vue-expect-error type error -->
        <Select v-bind="componentField" :default-value="0">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <!-- @vue-expect-error typerror -->
              <SelectItem :value="0">
                排麦
              </SelectItem>
              <!-- @vue-expect-error typerror -->
              <SelectItem :value="1">
                抢麦
              </SelectItem>
              <!-- @vue-expect-error typerror -->
              <SelectItem :value="2">
                抢断
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>

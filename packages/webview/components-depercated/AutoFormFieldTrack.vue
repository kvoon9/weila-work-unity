<script setup lang="ts">
import type { FieldProps } from './ui/auto-form/interface'
import { isNumber } from '@antfu/utils'
import { AutoFormLabel } from './ui/auto-form'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from './ui/form'

defineProps<FieldProps>()
</script>

<template>
  <FormField v-slot="{ value, handleChange }" :name="fieldName">
    <FormItem v-bind="$attrs" class="space-y-4 items-center justify-between rounded-lg border p-4">
      <AutoFormLabel v-if="!config?.hideLabel">
        {{ config?.label }}
      </AutoFormLabel>
      <FormControl>
        <!-- @vue-expect-error need a number value -->
        <RadioGroup
          :default-value="isNumber(value) ? value : 0"
          :value="value"
          class="flex relative"
          @update:model-value="handleChange"
        >
          <div class="flex items-center space-x-2">
            <!-- @vue-expect-error need a number value -->
            <RadioGroupItem id="close" :value="0" />
            <Label for="close">关闭</Label>
          </div>
          <div class="flex items-center space-x-2">
            <!-- @vue-expect-error need a number value -->
            <RadioGroupItem id="high" :value="1" />
            <Label for="high">高</Label>
          </div>
          <div class="flex items-center space-x-2">
            <!-- @vue-expect-error need a number value -->
            <RadioGroupItem id="mid" :value="2" />
            <Label for="mid">中</Label>
          </div>
          <div class="flex items-center space-x-2">
            <!-- @vue-expect-error need a number value -->
            <RadioGroupItem id="low" :value="3" />
            <Label for="low">低</Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>

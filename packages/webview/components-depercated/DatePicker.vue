<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { today } from '~/shared/const'

const props = defineProps<{
  default?: 'today'
  class: string | string[]
}>()

const value = defineModel<DateValue>('value')
const formatedValue = defineModel<string>('formatedValue')
const open = defineModel<boolean>('open', { default: false })

if (props.default === 'today')
  value.value = today

watchEffect(() => {
  formatedValue.value = value.value
    ? createFormattedDate(value.value)
    : '选择一个日期'
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'justify-start text-left font-normal',
          !value && 'text-muted-foreground',
          props.class,
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ formatedValue }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar v-model="value" locale="zh-CN" initial-focus />
    </PopoverContent>
  </Popover>
</template>

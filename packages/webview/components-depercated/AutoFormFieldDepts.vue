<script setup lang="ts">
import type { FieldProps } from './ui/auto-form/interface'
import type { DeptGetallModel } from '~/fixture/mock'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'
import { AutoFormLabel } from './ui/auto-form'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from './ui/form'

defineProps<FieldProps>()

const { $v1 } = useNuxtApp()

const { data: corp } = useCorp()

const { data: depts } = useQuery<DeptGetallModel['data']['depts']>({
  enabled: computed(() => Boolean(corp.value?.num)),
  queryKey: [weilaApiUrl('/corp/web/dept-getall'), corp],
  queryFn: () => $v1(weilaApiUrl('/corp/web/dept-getall'), {
    body: {
      org_num: corp.value!.num,
    },
  }).then((i: any) => i.depts.sort((a: any, b: any) => a.id - b.id)),
})
</script>

<template>
  <FormField v-slot="{ componentField }" :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel">
        {{ config?.label }}
      </AutoFormLabel>
      <FormControl>
        <!-- @vue-expect-error type error -->
        <Select v-bind="componentField" :default-value="value || 0">
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectGroup>
              <!-- <SelectItem :value="0">
                无部门
              </SelectItem> -->
              <!-- @vue-expect-error type error -->
              <SelectItem v-for="dept, key in depts" :key :value="dept.id">
                {{ dept.name }}
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

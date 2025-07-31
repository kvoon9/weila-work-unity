<script setup lang="ts">
import type { DeptModel } from '~/api/contact'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const props = defineProps<{
  dept?: DeptModel
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { form, rules, handleSubmit } = useForm(v.object({
  name: v.string(),
}))

const qc = useQueryClient()

const { mutate, isPending } = useWeilaMutation('corp/address/change-dept', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/address/get-all-dept'] })
    emits('success')
  },
})

watch(open, (val) => {
  if (val)
    form.value.name = props.dept?.name || ''
})

const submit = handleSubmit((values: any) => {
  mutate({
    ...values,
    dept_id: props.dept!.id,
  })
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="data-[state=open]:animate-overlayShow fixed inset-0 z-100 bg-black:60" />
      <DialogContent
        bg-base
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in focus:outline-none"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          {{ t('dept.edit') }}
        </DialogTitle>

        <a-form :rules :model="form" @submit="submit">
          <a-form-item field="name" :label="t('org-form.name.label')">
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>

          <a-button type="primary" mla w-fit :loading="isPending" html-type="submit">
            {{ t('button.submit') }}
          </a-button>
        </a-form>
        <DialogClose
          class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-gray2 focus:shadow-[0_0_0_2px] focus:shadow-gray7 focus:outline-none"
          aria-label="Close"
        >
          <i i-carbon-close />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

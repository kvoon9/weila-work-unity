<script setup lang="ts">
import { objectEntries } from '@antfu/utils'
import Message from '@arco-design/web-vue/es/message'
import md5 from 'md5'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const { form, handleSubmit, rules, reset } = useForm(v.object({
  old_password: v.string(),
  new_password: v.string(),
}))

const { mutate, isPending } = useWeilaMutation('corp/user/change-password', {
  onSuccess() {
    Message.success(t('message.success'))
    reset()
  },
})

const submit = handleSubmit((values) => {
  mutate(Object.fromEntries(objectEntries(values).map(([key, value]) => [key, md5(value)])))
})
</script>

<template>
  <DialogRoot>
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
          {{ t('button.reset-password') }}
        </DialogTitle>

        <a-form :model="form" :rules @submit="submit">
          <a-form-item field="old_password" :label="t('old-password')">
            <a-input v-model="form.old_password" :max-length="20" show-word-limit type="password" />
          </a-form-item>
          <a-form-item field="new_password" :label="t('new-password')">
            <a-input v-model="form.new_password" :max-length="20" show-word-limit type="password" />
          </a-form-item>
          <a-form-item>
            <a-button mla type="primary" :loading="isPending" html-type="submit">
              {{ t('button.submit') }}
            </a-button>
          </a-form-item>
        </a-form>

        <DialogClose class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-gray2 focus:shadow-[0_0_0_2px] focus:shadow-gray7 focus:outline-none" aria-label="Close">
          <i i-carbon-close />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import type { SendVerifySmsBody } from '~/api/verify-sms'
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'
import { sendVerifySms } from '~/api/verify-sms'
import { timestamp } from '~/shared/states'

const props = defineProps<{
  classes?: string | string[]
  opts: SendVerifySmsBody
}>()

const emits = defineEmits(['success', 'error'])

const { t } = useI18n()

const lastSendTime = useLocalStorage(`lst-${props.opts.smstype}`, -1)
const countdown = computed(() => 60 - (Math.floor((timestamp.value / 1000) - (lastSendTime.value / 1000))))
const state = computed<'idle' | 'countdown'>(() => countdown.value <= 0 ? 'idle' : 'countdown')

const { mutate: sendSMS, isPending } = useMutation({
  mutationFn: sendVerifySms,
  onSuccess() {
    Message.success({
      content: t('sendSMS.success.hint'),
    })
    lastSendTime.value = timestamp.value
    emits('success')
  },
  onError() {
    emits('error')
  },
})
</script>

<template>
  <a-button
    :loading="isPending" :disabled="state === 'countdown'" min-w-30 :class="classes" type="primary"
    @click="() => sendSMS(opts)"
  >
    {{ state === 'idle' ? t('register.form.getSMS') : countdown }}
  </a-button>
</template>

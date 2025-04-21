<script setup lang="ts">
import type { SendSmsVerifycodeModel, SendSmsVerifycodePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { WeilaErrorCode } from '~/plugins/api'
import { timestamp } from '~/shared/states'
import { useToast } from './ui/toast/use-toast'

const props = defineProps<{
  classes?: string | string[]
  opts: SendSmsVerifycodePayload
}>()

const emits = defineEmits(['success', 'error'])

const lastSendTime = useLocalStorage(`lst-${props.opts.sms_type}`, -1)
const countdown = computed(() => 60 - (Math.floor((timestamp.value / 1000) - (lastSendTime.value / 1000))))
const state = computed<'idle' | 'countdown'>(() => countdown.value <= 0 ? 'idle' : 'countdown')

const { $v1 } = useNuxtApp()
const { toast } = useToast()

const { mutate: sendSMS, isPending } = useMutation({
  mutationFn: async (body: SendSmsVerifycodePayload) => {
    const url = '/corp/web/send-sms-verifycode'
    const res = await $v1<SendSmsVerifycodeModel | undefined>(
      url,
      { body },
    )

    if (res && res.errcode !== WeilaErrorCode.SUCCESS) {
      throw new Error(res.errmsg)
    }

    return res
  },
  onSuccess() {
    toast({
      title: '短信发送成功',
    })

    lastSendTime.value = timestamp.value
    emits('success')
  },
  onError(error) {
    toast({
      title: '短信发送失败',
      description: error.message,
    })
    emits('error')
  },
})
</script>

<template>
  <Button
    :loading="isPending" :disabled="state === 'countdown'" min-w-30 :class="classes" type="button"
    @click="() => sendSMS(opts)"
  >
    {{ state === 'idle' ? '获取短信验证码' : countdown }}
  </Button>
</template>

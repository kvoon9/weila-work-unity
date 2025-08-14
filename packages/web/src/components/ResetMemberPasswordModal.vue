<script setup lang="ts">
import type { Corp } from '~/types'
import type { Member } from '~/types/api'
import { Message } from '@arco-design/web-vue'
import { useMutation } from '@tanstack/vue-query'
import md5 from 'md5'
import { weilaApiUrl } from '~/api'

const props = defineProps<{
  member?: Member
}>()

const { t } = useI18n()
const { data: corp } = useWeilaFetch<Corp>('corp/org/get-my-org')
const org_num = computed(() => corp.value?.num)

const formRef = templateRef('formRef')

const open = defineModel('open', { default: false })

interface Payload {
  org_num: number
  password: string
  member_id: number
}

const form = reactive<Payload>({
  org_num: 0,
  password: '',
  member_id: 0,
})

watch(org_num, (value) => {
  value && (form.org_num = value)
})

watch(() => props.member, (m) => {
  if (m)
    form.member_id = m.user_id
})

// corpStore.$subscribe((_, state) => {
//   if (state.data)
//     form.org_num = state.data.num
// }, { immediate: true })

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Payload) => {
    return useWeilaApi().value.v2.request.post(weilaApiUrl('/corp/web/member-reset-password'), {
      ...payload,
      password: md5(payload.password),
    })
  },
  onSuccess() {
    // createMemberModalVisible.value = false
    Message.success(t('message.success'))
    open.value = false
  },
})

function handleSubmit() {
  return formRef.value?.validate((errors: any) => {
    if (errors)
      return

    mutate(form, {
      onSuccess: () => {
        formRef.value?.resetFields()
      },
    })
  })
}
</script>

<template>
  <ModalTrigger v-model:open="open" :title=" t('reset-password.button') ">
    <template #content>
      <a-form ref="formRef" :model="form" @submit="handleSubmit">
        <a-form-item
          field="password" :label="t('password')" :rules="[{ required: true }]"
          :validate-trigger="['change', 'blur']"
        >
          <a-input v-model="form.password" :max-length="20" show-word-limit />
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-button type="primary" :loading="isPending" @click="(e) => formRef?.handleSubmit(e)">
        {{ t('button.submit') }}
      </a-button>
    </template>
  </ModalTrigger>
</template>

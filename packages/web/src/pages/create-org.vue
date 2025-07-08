<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'

const emits = defineEmits(['success'])

definePage({
  meta: {
    layout: 'plain',
  },
})

const router = useRouter()

const { t } = useI18n()

const avatarUploaderRef = templateRef('avatarUploaderRef')

const open = defineModel('open', { default: false })

interface Payload {
  name: string
  avatar: string
}

const form = reactive({
  name: '',
  avatar: '',
})

const formRef = templateRef('formRef')

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Payload) => weilaRequest.post(
    weilaApiUrl('/corp/web/org-create'),
    payload,
  ),
  onSuccess: () => {
    formRef.value?.resetFields()
    open.value = false
    Message.success(t('message.success'))
    emits('success')
  },
})

function handleSubmit() {
  return formRef.value?.validate(async (errors: any) => {
    if (errors)
      return

    // @ts-expect-error type error: `defineExpose` no type declare find
    const { upload } = avatarUploaderRef.value
    if (form.avatar && !isRemoteImage(form.avatar)) {
      await upload()
    }

    mutate(form, {
      onSuccess: () => {
        formRef.value?.resetFields()
        router.replace('/contact/org')
      },
    })
  })
}
</script>

<template>
  <div pt8>
    <a-form ref="formRef" layout="vertical" mxa w500px border p8 rounded-lg :model="form" @submit="handleSubmit">
      <h1 text-2xl text-center leading-loose font-semibold>
        创建企业
      </h1>
      <a-form-item field="name" label="企业名">
        <a-input v-model="form.name" :max-length="20" show-word-limit />
      </a-form-item>
      <a-form-item field="avatar" :label="t('member.form.avatar.label')" :validate-trigger="['change', 'blur']">
        <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
      </a-form-item>
      <div flex="~ col gap4 items-center">
        <a-button w="2/3" type="text" @click="() => formRef?.resetFields()">
          {{ t('button.reset') }}
        </a-button>
        <a-button w="2/3">
          {{ t('button.cancel') }}
        </a-button>
        <a-button w="2/3" type="primary" :loading="isPending" @click="(e) => formRef?.handleSubmit(e)">
          {{ t('button.submit') }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>

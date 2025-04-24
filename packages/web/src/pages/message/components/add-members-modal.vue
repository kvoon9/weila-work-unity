<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useMutation } from '@tanstack/vue-query'

const { groupId } = defineProps<{ groupId: number }>()

const emit = defineEmits(['onSuccess', 'onError'])

const visible = defineModel<boolean>('visible')

const { t } = useI18n()

const formRef = templateRef('formRef')

interface AddMemberPayload {
  group_id: number
  member_ids: (number | string)[]
}

const form = reactive<AddMemberPayload>({
  group_id: groupId,
  member_ids: [],
})

const { mutate, isPending } = useMutation({
  mutationFn: (payload: AddMemberPayload) => weilaRequest.post('/corp/web/group-member-add', {
    ...payload,
    member_ids: payload.member_ids.map(i => Number(i)),
  }),
  onSuccess: () => {
    Message.success('Member added successfully')
    emit('onSuccess')
  },
  onError: (error) => {
    emit('onError', error)
  },
})

function handleSubmit() {
  return formRef.value?.validate((errors) => {
    if (errors)
      return

    mutate(form, {
      onSuccess: () => {
        visible.value = false
        formRef.value?.resetFields()
      },
    })
  })
}
</script>

<template>
  <a-modal v-model:visible="visible" :title="t('button.add-member')">
    <template #footer>
      <a-button @click="() => visible = false">
        {{ t('button.cancel') }}
      </a-button>
      <a-button
        type="primary" :loading="isPending" :disabled="!form.member_ids.length"
        @click="(e) => formRef?.handleSubmit(e)"
      >
        {{ t('button.submit') }}
      </a-button>
    </template>
    <a-form ref="formRef" :model="form" layout="vertical" @submit="handleSubmit">
      <a-form-item
        label="ID" name="member_ids" :rules="[{
          validator(value, callback) {
            if (value.length === 0) {
              callback('at least one member ID')
              return
            }

            callback()
          },
        }]" :validate-trigger="['change', 'blur']"
      >
        <a-input-tag
          v-model:model-value="form.member_ids" :min-tag-text-length="1" :max-tag-text-length="10" :max="10"
          allow-clear class="w-full" unique-value
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

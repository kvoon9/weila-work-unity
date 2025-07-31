<script setup lang="ts">
import type { GroupMemberModel } from '~/api/contact';
import Message from '@arco-design/web-vue/es/message';
import { useMutation } from '@tanstack/vue-query';
import { shallowRef } from 'vue';

const props = defineProps<{
  groupId: number
  member?: GroupMemberModel
}>()
const emits = defineEmits(['success'])

const { themeColor } = useAppStore()

const { t } = useI18n()

const open = shallowRef(false)

interface Payload {
  group_id: number
  member_id: number
  prority: number
  tts: number
  loc_share: number
}

const form = reactive<Payload>({
  group_id: 0,
  member_id: 0,

  prority: 0,
  tts: 0,
  loc_share: 0,
})

$inspect(form)

watchImmediate(() => props.member, (member) => {
  if (member) {
    form.group_id = props.groupId
    form.member_id = member.user_id
    form.prority = member.tts
    form.loc_share = member.loc_share
  }
})

const formRef = templateRef('formRef')

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Payload) => weilaRequest.post(
    '/corp/web/group-member-change',
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
  return formRef.value?.validate((errors) => {
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
          {{ t('button.edit-group-member') }} <a-tag>{{ member?.name }}</a-tag>
        </DialogTitle>
        <a-form ref="formRef" :model="form" auto-label-width @submit="handleSubmit">
          <!-- <a-form-item field="prority" :label="t('priority')" :validate-trigger="['change', 'blur']">
            <a-input-number v-model="form.prority" size="large" mode="button" />
          </a-form-item> -->
          <a-form-item field="tts" label="TTS" :validate-trigger="['change', 'blur']">
            <a-switch
              v-model="form.tts" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
              unchecked-color="#ddd"
            />
          </a-form-item>
          <a-form-item
            field="loc_share" :label="t('member.form.loc_share.label')"
            :validate-trigger="['change', 'blur']"
          >
            <a-switch
              v-model="form.loc_share" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
              unchecked-color="#ddd"
            />
          </a-form-item>
        </a-form>

        <div class="mt-[25px] flex justify-end">
          <a-button type="text" @click="() => formRef?.resetFields()">
            {{ t('button.reset') }}
          </a-button>
          <DialogClose as-child>
            <a-button>
              {{ t('button.cancel') }}
            </a-button>
          </DialogClose>
          <a-button type="primary" :loading="isPending" @click="(e) => formRef?.handleSubmit(e)">
            {{ t('button.submit') }}
          </a-button>
        </div>
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

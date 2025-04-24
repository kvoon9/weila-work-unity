<script setup lang="ts">
import type { DeptModel } from '~/api/contact'
import Message from '@arco-design/web-vue/es/message'
import { useMutation } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'

const props = defineProps<{
  dept?: DeptModel
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const { data: corp } = storeToRefs(useCorpStore())
const contactStore = useContactStore()

const open = defineModel('open', { default: false })

const form = reactive({
  name: '',
})

watch(open, (val) => {
  if (val)
    form.name = props.dept?.name || ''
})

const formRef = templateRef('formRef')

interface Payload {
  name: string
  org_num: number
  dept_id: number
}

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Payload) => weilaRequest.post(
    weilaApiUrl('/corp/web/dept-change'),
    payload,
  ),
  onSuccess: () => {
    formRef.value?.resetFields()
    open.value = false
    Message.success(t('message.success'))
    contactStore.refetch()
  },
})

function handleSubmit() {
  return formRef.value?.validate((errors) => {
    if (errors)
      return

    mutate({
      ...form,
      dept_id: props.dept!.id,
      org_num: corp.value!.num,
    }, {
      onSuccess: () => {
        formRef.value?.resetFields()
        emits('success')
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
          {{ t('dept.edit') }}
        </DialogTitle>

        <a-form ref="formRef" :model="form" @submit="handleSubmit">
          <a-form-item field="name" :label="t('org-form.name.label')" :rules="[{ required: true }]">
            <a-input v-model="form.name" :max-length="20" show-word-limit />
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

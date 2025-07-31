<script setup lang="ts">
import type { Member } from '~/types/api'
import { Message } from '@arco-design/web-vue'
import { useMutation } from '@tanstack/vue-query'
import md5 from 'md5'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/api'

const props = defineProps<{
  member?: Member
}>()

const { t } = useI18n()
const corpStore = useCorpStore()
const formRef = templateRef('formRef')

const org_num = shallowRef(0)
corpStore.$subscribe((_, { data }) => data ? org_num.value = data.num : void 0, { immediate: true })

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

watch(() => props.member, (m) => {
  if (m)
    form.member_id = m.user_id
})

corpStore.$subscribe((_, state) => {
  if (state.data)
    form.org_num = state.data.num
}, { immediate: true })

const { mutate, isPending } = useMutation({
  mutationFn: (payload: Payload) => {
    return weilaRequest.post(weilaApiUrl('/corp/web/member-reset-password'), {
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
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in bg-base focus:outline-none"
        @interact-outside="event => {
          const target = event.target as HTMLElement;
          console.log(target)
          if (target?.closest('.arco-select-option')) return event.preventDefault()
        }"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          {{ t('reset-password.button') }}
        </DialogTitle>
        <a-form ref="formRef" :model="form" @submit="handleSubmit">
          <a-form-item
            field="password" :label="t('password')" :rules="[{ required: true }]"
            :validate-trigger="['change', 'blur']"
          >
            <a-input v-model="form.password" :max-length="20" show-word-limit />
          </a-form-item>
        </a-form>

        <div class="mt-[25px] flex justify-end">
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

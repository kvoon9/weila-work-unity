<script setup lang="ts">
import type { MemberCreatePayload } from 'generated/mock/weila'
import { Message } from '@arco-design/web-vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import md5 from 'md5'
import { weilaApiUrl } from '~/api'
import { weilaFetch } from '~/api/instances/fetcher'
import { weilaRequest } from '~/api/instances/request'

const emits = defineEmits(['success'])

const { t } = useI18n()
const { themeColor } = useAppStore()
const corpStore = useCorpStore()
const formRef = templateRef('formRef')

const org_num = ref(0)
corpStore.$subscribe((_, { data }) => data ? org_num.value = data.num : void 0, { immediate: true })

const open = ref(false)

const { data: depts } = useQuery<Array<{ id: number, name: string }>>({
  enabled: computed(() => Boolean(org_num.value)),
  queryKey: [weilaApiUrl('/corp/web/dept-getall'), org_num],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/dept-getall'), {
    body: {
      org_num: org_num.value,
    },
  }).then(i => i.depts),
})
const avatarUploaderRef = templateRef('avatarUploaderRef')

const form = reactive<MemberCreatePayload>({
  org_num: corpStore.data?.num || 0,
  name: '',
  password: '',
  dept_id: 0,
  sex: 0,
  avatar: '',
  phone: '',
  tts: 0,
  loc_share: 0,
  job_num: '',
})

$inspect(form)

corpStore.$subscribe((_, state) => {
  if (state.data)
    form.org_num = state.data.num
}, { immediate: true })

const { mutate: createMember, isPending } = useMutation({
  mutationFn: (payload: MemberCreatePayload) => {
    return weilaRequest.post('/corp/web/member-create', {
      ...payload,
      password: md5(payload.password),
      tts: payload.tts ? 1 : 0,
      loc_share: payload.loc_share ? 1 : 0,
    })
  },
  onSuccess() {
    // createMemberModalVisible.value = false
    Message.success(t('message.success'))
    open.value = false
    emits('success')
  },
})

function handleSubmit() {
  return formRef.value?.validate(async (errors) => {
    if (errors)
      return

    // @ts-expect-error type error: `defineExpose` no type declare find
    const { upload } = avatarUploaderRef.value
    if (form.avatar && !isRemoteImage(form.avatar)) {
      await upload()
    }

    createMember(form, {
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
          {{ t('create-member') }}
        </DialogTitle>
        <a-form ref="formRef" :model="form" @submit="handleSubmit">
          <a-form-item
            field="name" :label="t('member.form.name.label')" :rules="[{ required: true }]"
            :validate-trigger="['change', 'blur']"
          >
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>
          <a-form-item field="dept_id" :label="t('member.form.dept.label')">
            <a-select allow-search :empty="t('no-data')" @change="(value) => form.dept_id = Number(value)">
              <a-option v-for="{ name, id }, key in depts" :key :value="id" :label="name" />
            </a-select>
          </a-form-item>
          <a-form-item
            field="job_num" :label="t('member.form.job-num.label')" :rules="[{ required: false }]"
            :validate-trigger="['change', 'blur']"
          >
            <a-input v-model="form.job_num" :max-length="12" show-word-limit />
          </a-form-item>
          <a-form-item
            field="phone" :label="t('member.form.phone.label')" :rules="[{ required: false }]"
            :validate-trigger="['change', 'blur']"
          >
            <a-input v-model="form.phone" :max-length="12" show-word-limit />
          </a-form-item>
          <a-form-item
            field="password" :label="t('member.form.password.label')" :rules="[{ required: true }]"
            :validate-trigger="['change', 'blur']"
          >
            <a-input-password v-model="form.password" />
          </a-form-item>
          <a-form-item field="sex" :label="t('member.form.gender.label')" :validate-trigger="['change', 'blur']">
            <a-radio-group v-model="form.sex">
              <a-radio :value="0">
                {{ t('male') }}
              </a-radio>
              <a-radio :value="1">
                {{ t('female') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item field="avatar" :label="t('member.form.avatar.label')" :validate-trigger="['change', 'blur']">
            <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
          </a-form-item>
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

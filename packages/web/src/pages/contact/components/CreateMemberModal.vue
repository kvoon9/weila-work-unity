<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()
const { themeColor } = useAppStore()
const corpStore = useCorpStore()

const org_num = shallowRef(0)
corpStore.$subscribe((_, { data }) => data ? org_num.value = data.num : void 0, { immediate: true })

const avatarUploaderRef = useTemplateRef('avatarUploaderRef')

const open = shallowRef(false)

const { data: depts } = useWeilaFetch('corp/address/get-all-dept')

const { form, rules, handleSubmit, reset } = useForm(v.object({
  name: v.pipe(v.string(), v.maxLength(20)),
  job_num: v.optional(v.string(), ''),
  dept_id: v.optional(v.number(), 0),
  sex: v.optional(v.number(), 0),
  avatar: v.optional(v.string(), ''),
  phone: v.string(),
  is_admin: v.optional(v.number(), 0),
  loc_share: v.optional(v.number(), 0),
  track: v.optional(v.number(), 0),
}))

const { mutate } = useWeilaMutation<{
  id: number
  name: string
  user_count: number
}[]>('corp/address/create-member', {
  onSuccess() {
    Message.success(t('message.success'))
    open.value = false
    useQueryClient().invalidateQueries({ queryKey: ['corp/address/get-all-member'] })
    reset()
  },
})

const submit = handleSubmit(async (values) => {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.value.avatar && !isRemoteImage(form.value.avatar)) {
    await upload()
  }

  mutate(values)
})
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
        <a-form :rules :model="form" @submit="submit">
          <a-form-item
            field="name" :label="t('member.form.name.label')"
          >
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>
          <a-form-item field="dept_id" :label="t('member.form.dept.label')">
            <a-select allow-search :empty="t('no-data')" @change="(value: string) => form.dept_id = Number(value)">
              <a-option v-for="{ name, id }, key in depts" :key :value="id" :label="name" />
            </a-select>
          </a-form-item>
          <a-form-item
            field="job_num" :label="t('member.form.job-num.label')"
          >
            <a-input v-model="form.job_num" :max-length="12" show-word-limit />
          </a-form-item>
          <a-form-item field="phone" :label="t('member.form.phone.label')">
            <a-input v-model="form.phone" :max-length="12" show-word-limit />
          </a-form-item>
          <a-form-item field="sex" :label="t('member.form.gender.label')">
            <a-radio-group v-model="form.sex">
              <a-radio :value="0">
                {{ t('male') }}
              </a-radio>
              <a-radio :value="1">
                {{ t('female') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item field="avatar" :label="t('member.form.avatar.label')">
            <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
          </a-form-item>
          <a-form-item field="is_admin" label="管理员">
            <a-switch
              v-model="form.is_admin" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
              unchecked-color="#ddd"
            />
          </a-form-item>
          <!-- <a-form-item field="tts" label="TTS" :validate-trigger="['change', 'blur']">
            <a-switch
              v-model="form.tts" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
              unchecked-color="#ddd"
            />
          </a-form-item> -->
          <a-form-item
            field="loc_share" :label="t('member.form.loc_share.label')"
          >
            <a-switch
              v-model="form.loc_share" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
              unchecked-color="#ddd"
            />
          </a-form-item>
          <a-form-item>
            <a-button html-type="submit" type="primary" size="large" mla>
              {{ t('button.create') }}
            </a-button>
          </a-form-item>
        </a-form>
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

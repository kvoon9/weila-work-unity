<script setup lang="ts">
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'

import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'
import { TrackType } from '~/api/contact'

const props = defineProps<{
  member?: Member
}>()

const { t } = useI18n()
const { themeColor } = useAppStore()
const avatarUploaderRef = templateRef('avatarUploaderRef')

const open = defineModel('open', { default: false })

$inspect(() => props.member)

const { form, rules, handleSubmit, reset } = useForm(v.object({
  user_id: v.optional(v.number(), () => props.member?.user_id),
  name: v.optional(v.pipe(v.string(), v.maxLength(20)), () => props.member?.name),
  job_num: v.optional(v.string(), () => props.member?.job_num),
  dept_id: v.optional(v.number(), () => props.member?.dept_id),
  sex: v.optional(v.number(), () => props.member?.sex),
  avatar: v.optional(v.string(), () => props.member?.avatar),
  phone: v.optional(v.string(), () => props.member?.phone),
  is_admin: v.optional(v.number(), () => props.member?.is_admin),
  loc_share: v.optional(v.number(), () => props.member?.loc_share),
  track: v.optional(v.number(), () => props.member?.track),
}), {
  watch: [() => props.member],
})

const { data: depts } = useWeilaFetch<{
  id: number
  name: string
  user_count: number
}[]>('corp/address/get-all-dept')

const qc = useQueryClient()

watchEffect(() => open.value && reset())

const { mutate: createMember } = useWeilaMutation('corp/address/change-member', {
  onSuccess() {
    reset()
    open.value = false
    Message.success(t('success'))
    qc.invalidateQueries({ queryKey: ['corp/address/get-member-list'] })
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-member-list'] })
  },
})

const submit = handleSubmit(async (values) => {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (!isRemoteImage(form.value.avatar || '')) {
    await upload()
  }
  createMember(values)
})
</script>

<template>
  <ModalTrigger v-model:open="open" :title=" t('edit') ">
    <template #content>
      <a-form :rules :model="form" @submit="submit">
        <a-form-item
          field="name" :label="t('member.form.name.label')"
        >
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item field="dept_id" :label="t('member.form.dept.label')">
          <a-select v-model:model-value="form.dept_id" allow-search :empty="t('no-data')">
            <a-option v-for="{ name, id }, key in depts" :key :value="id" :label="name" />
          </a-select>
        </a-form-item>
        <a-form-item
          field="job_num" :label="t('member.form.job-num.label')"
        >
          <a-input v-model="form.job_num" :max-length="12" show-word-limit />
        </a-form-item>
        <a-form-item
          field="phone" :label="t('member.form.phone.label')"
        >
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
        <!-- <a-form-item field="tts" label="TTS" >
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
        <a-form-item v-if="member?.type !== 1" field="is_admin" label="管理员">
          <a-switch
            v-model="form.is_admin" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
            unchecked-color="#ddd"
          />
        </a-form-item>
        <a-form-item
          field="track" :label="t('change-member.form.track.label')"
        >
          <a-radio-group v-model="form.track" type="button">
            <a-radio :value="TrackType.Close">
              {{ t('track-type.close') }}
            </a-radio>
            <a-radio :value="TrackType.Low">
              {{ t('track-type.low') }}
            </a-radio>
            <a-radio :value="TrackType.Medium">
              {{ t('track-type.medium') }}
            </a-radio>
            <a-radio :value="TrackType.High">
              {{ t('track-type.high') }}
            </a-radio>
            <a-radio v-vip :value="TrackType.Fast">
              {{ t('track-type.fast') }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">
            {{ t('button.submit') }}
          </a-button>
        </a-form-item>
      </a-form>
    </template>
  </ModalTrigger>
</template>

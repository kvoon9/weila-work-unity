<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { useForm } from 'zod-arco-rules/valibot'
import { TrackType } from '~/api/contact'

const { t } = useI18n()
const { themeColor } = useAppStore()
const formRef = templateRef('formRef')
const authStore = useAuthStore()

const open = defineModel('open', { default: false })

const avatarUploaderRef = templateRef('avatarUploaderRef')

const { data: depts } = useWeilaFetch('corp/address/get-all-dept', {}, {
  enabled: open,
})

const { form, rules, handleSubmit, reset } = useForm(v.object({
  verifycode: v.pipe(v.string(), v.minLength(1, '验证码不能为空')),
  name: v.pipe(v.string(), v.minLength(1, '姓名不能为空'), v.maxLength(20, '姓名最多20个字符')),
  job_num: v.optional(v.string(), ''),
  dept_id: v.optional(v.number(), 0),
  sex: v.optional(v.number(), 0),
  avatar: v.optional(v.string(), ''),
  phone: v.optional(v.string(), ''),
  loc_share: v.optional(v.number(), 1),
  track: v.optional(v.number(), 0),
}))

watchEffect(() => open.value && reset())

const qc = useQueryClient()

const { mutate } = useWeilaMutation('corp/address/add-device', {
  onSuccess() {
    Message.success(t('message.success'))
    qc.invalidateQueries({ queryKey: ['corp/address/get-member-list'] })
    open.value = false
    reset()
  },
})

const submit = handleSubmit(async (values: any) => {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.value.avatar && !isRemoteImage(form.value.avatar))
    await upload()

  mutate(values)
})
</script>

<template>
  <ModalTrigger v-model:open="open" :trigger="{ type: 'primary' }" :title=" t('add-device') ">
    <template #content>
      <a-form ref="formRef" :model="form" :rules auto-label-width @submit="submit">
        <a-form-item field="name" :label="t('name')" required>
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item field="verifycode" :label="t('verify-code')" required>
          <a-input v-model="form.verifycode" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item :label="t('phone-number')" field="phone">
          <a-input v-model="form.phone" :max-length="11" show-word-limit />
        </a-form-item>
        <a-form-item field="dept_id" :label="t('member.form.dept.label')">
          <a-select allow-search :empty="t('no-data')" @change="(value: string) => form.dept_id = Number(value)">
            <a-option v-for="{ name, id }, key in depts" :key :value="id" :label="name" />
          </a-select>
        </a-form-item>

        <a-form-item field="sex" :label="t('gender')">
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
        <a-form-item v-if="authStore.vip.vip_supports.find((i) => i.name === 'track')?.support" field="track" :label="t('change-member.form.track.label')">
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
            <a-radio v-disabled="{ value: !authStore.vip.vip_supports.find((i) => i.name === 'track')?.quick_support, title: '专业版功能' } " :value="TrackType.Fast">
              {{ t('track-type.fast') }}
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item>
          <a-button mla type="primary" @click="(e) => formRef?.handleSubmit(e)">
            {{ t('button.submit') }}
          </a-button>
        </a-form-item>
      </a-form>
    </template>
  </ModalTrigger>
</template>

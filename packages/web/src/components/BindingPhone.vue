<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { form, rules, handleSubmit, reset } = useForm(v.object({
  phone: v.pipe(v.string(() => t('binding-phone-form.err-msg.phone-required'))),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.pipe(
    v.string(() => t('binding-phone-form.err-msg.verifycode-required')),
    v.minLength(4, () => t('binding-phone-form.err-msg.verifycode-min')),
    v.maxLength(6, () => t('binding-phone-form.err-msg.verifycode-max')),
  ),
}))

watchEffect(() => open.value && reset())

const qc = useQueryClient()

const { mutate } = useWeilaMutation('corp/user/bind-phone', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
    reset()
    qc.invalidateQueries({ queryKey: ['corp/user/get-selfinfo'] })
  },
})

const submit = handleSubmit((values: any) => {
  mutate(values)
})

const verifyImageAnswer = shallowRef('')
const { data: verifyImageData, refetch: refreshImageCode } = useWeilaFetch<{ id: string, image: string }>(
  'common/get-image-verifycode?width=160&height=80',
  {},
  {
    enabled: open,
  },
)
</script>

<template>
  <a-modal v-model:visible="open" :footer="false">
    <template #title>
      <div>{{ t('binding-phone-form.title') }}</div>
    </template>

    <a-form mxa w-fit :model="form" :rules layout="vertical" @submit="submit">
      <a-form-item field="phone" hide-label>
        <a-input-group>
          <a-select v-model="form.country_code" style="width: 100px" :placeholder="t('binding-phone-form.placeholder.country-code')">
            <a-option value="86" label="+86" />
            <a-option value="852" label="+852" />
            <a-option value="853" label="+853" />
            <a-option value="886" label="+886" />
          </a-select>
          <a-input
            v-model="form.phone"
            :placeholder="t('binding-phone-form.placeholder.phone')"
            allow-clear
          />
        </a-input-group>
      </a-form-item>

      <a-form-item field="country_code">
        <div flex gap2>
          <a-input
            v-model="verifyImageAnswer"
            :placeholder="t('binding-phone-form.placeholder.image-verifycode')"
            allow-clear
            :max-length="6"
          />
          <img v-if="verifyImageData?.image" :src="verifyImageData.image" alt="验证码" w-30 @click="() => refreshImageCode()">
        </div>
      </a-form-item>

      <a-form-item field="verifycode">
        <div flex gap2>
          <a-input
            v-model="form.verifycode"
            :placeholder="t('binding-phone-form.placeholder.sms-verifycode')"
            allow-clear
          />
          <SendSmsButton
            :opts="{
              phone: form.phone,
              countrycode: form.country_code || '86',
              verify_id: verifyImageData?.id || '',
              verify_answer: verifyImageAnswer,
              smstype: 'work-bind-phone',
            }"
          />
        </div>
      </a-form-item>

      <a-form-item>
        <a-button mla type="primary" html-type="submit">
          {{ t('button.submit') }}
        </a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

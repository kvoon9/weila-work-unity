<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const { t } = useI18n()

const open = defineModel('open', { default: false })

const { form, rules, handleSubmit, reset } = useForm(v.object({
  phone: v.pipe(
    v.string('手机号不能为空'),
    v.regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  ),
  country_code: v.optional(v.string(), '86'),
  verifycode: v.pipe(
    v.string('验证码不能为空'),
    v.minLength(4, '验证码至少4位'),
    v.maxLength(6, '验证码最多6位'),
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
          <a-select v-model="form.country_code" style="width: 100px" placeholder="区号">
            <a-option value="86">
              +86
            </a-option>
            <a-option value="852">
              +852
            </a-option>
            <a-option value="853">
              +853
            </a-option>
            <a-option value="886">
              +886
            </a-option>
          </a-select>
          <a-input
            v-model="form.phone"
            placeholder="请输入手机号"
            allow-clear
          />
        </a-input-group>
      </a-form-item>

      <a-form-item field="country_code">
        <div flex gap2>
          <a-input
            v-model="verifyImageAnswer"
            placeholder="请输入图形验证码"
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
            placeholder="短信验证码"
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

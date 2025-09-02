<script setup lang="ts">
import type { CorpLegal, Legal, UserLegal } from '~/types/api'
import { Message } from '@arco-design/web-vue'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const weilaApi = useWeilaApi()

const { data, isFetched, refetch } = useWeilaFetch<Legal>('corp/legal/get-legal')

// const isVerified = computed(() => data.value?.state === 8)

const { t } = useI18n()

const category = shallowRef(data.value?.category || 0)
const { stop } = watch(data, (value) => {
  if (value) {
    category.value = value.category
    stop()
  }
})

const { form: userForm, rules: userRules, handleSubmit: handleUserSubmit } = useForm(v.object({
  id: v.optional(v.number(), () => (data.value as UserLegal)?.id ?? undefined),
  name: v.optional(v.pipe(v.string()), () => (data.value as UserLegal)?.name ?? ''),
  identify: v.optional(v.pipe(
    v.string(),
    v.length(18, t('legal-form.error.identify')),
  ), () => (data.value as UserLegal)?.identify ?? ''),
  identify_card_front: v.optional(v.pipe(
    v.string(),
    v.minLength(1, t('legal-form.error.identify-card-front')),
  ), () => (data.value as UserLegal)?.identify_card_front ?? ''),
  identify_card_reverse: v.optional(v.pipe(
    v.string(),
    v.minLength(1, t('legal-form.error.identify-card-reverse')),
  ), () => (data.value as UserLegal)?.identify_card_reverse ?? ''),
}), {
  watch: [category, data],
})

const { form: corpForm, rules: corpRules, handleSubmit: handleCorpSubmit } = useForm(v.object({
  id: v.optional(v.number(), () => (data.value as CorpLegal)?.id ?? undefined),
  name: v.optional(v.string(), () => (data.value as CorpLegal)?.name ?? ''),
  identify: v.optional(v.pipe(
    v.string(),
    v.length(18, t('legal-form.error.corp-identify')),
  ), () => (data.value as CorpLegal)?.identify ?? ''),
  business_license: v.optional(v.pipe(
    v.string(),
    v.minLength(1, t('legal-form.error.business-license')),
  ), () => (data.value as CorpLegal)?.business_license ?? ''),
}), {
  watch: [category, data],
})

const submitUser = handleUserSubmit(async (value) => {
  const url = `corp/legal/${data.value ? 'change' : 'add'}-user-legal`
  await weilaApi.value.v2.fetch(url, {
    body: value,
  })

  Message.success(t('message.success'))
  refetch()
})

const submitCorp = handleCorpSubmit(async (value) => {
  const url = `corp/legal/${data.value ? 'change' : 'add'}-corp-legal`
  await weilaApi.value.v2.fetch(url, {
    body: value,
  })

  Message.success(t('message.success'))
  refetch()
})

async function uploadFile(option: any) {
  const { onProgress, onError, onSuccess, fileItem } = option

  const formData = new FormData()
  formData.append('file', fileItem.file)

  return weilaApi.value.v2.request!
    .post<string>('common/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        if (e.total) {
          onProgress?.(e.loaded / e.total, e)
        }
      },
    })
    .then((url) => {
      onSuccess?.(url)
      return url
    })
    .catch(err => onError?.(err))
}
</script>

<template>
  <a-page-header
    :title="$t('adt-message')"
    @back="$router.back"
  >
    <a-skeleton v-if="!isFetched" :animation="true">
      <div p4 space-y-4>
        <a-skeleton-line :rows="1" :widths="[120]" />
        <a-skeleton-line :rows="1" :widths="['100%']" />
        <a-skeleton-line :rows="1" :widths="['100%']" />
        <a-skeleton-line :rows="1" :widths="[200]" />
      </div>
    </a-skeleton>
    <div v-else>
      <div p8 border-b>
        <a-steps
          :current="(() => {
            if (!data)
              return 1

            if (data.state === 0)
              return 2

            if (data.state === 8 || data.state === 9)
              return 3
          })()"
          w-300
        >
          <a-step :title="$t('legal-form.step.fill-info')" :description="$t('legal-form.step.description.fill-info')" />
          <a-step :title="$t('legal-form.step.waiting-verify')" :description="$t('legal-form.step.description.waiting-verify')" />
          <a-step v-if="data?.state === 9" :title="$t('legal-form.step.failed')" :description="$t('legal-form.step.description.failed')" />
          <a-step v-else :title="$t('legal-form.step.success')" :description="$t('legal-form.step.description.success')" />
        </a-steps>
      </div>

      <div v-if="data" p4 border-b>
        <a-descriptions
          :title="data.category === 0 ? t('legal.type.corp') : t('legal.type.personal')" size="large"
          bordered
          :data="[
            {
              label: t('legal.label.audit-status'),
              value: data.state === 8
                ? t('legal.value.passed')
                : data.state === 9
                  ? t('legal.value.failed')
                  : t('legal.value.pending'),
            },
            {
              label: t('legal.label.audit-category'),
              value: data.category === 0 ? t('legal.value.enterprise') : t('legal.value.personal'),
            },
            {
              label: t('legal.label.org-name'),
              value: data.name,
            },
            {
              label: t('legal.label.cert-number'),
              value: data.identify,
            },
            {
              label: t('legal.label.update-time'),
              value: data.updated,
            },

            {
              label: t('legal.label.reason'),
              value: data?.reason || t('legal.value.none'),
            },
          ]"
        />
      </div>

      <div v-if="data?.category !== 0" p4 border-b>
        <a-radio-group v-model="category" type="button">
          <a-radio :value="0">
            {{ $t('legal.enterprise') }}
          </a-radio>
          <a-radio :value="1">
            {{ $t('legal.type.personal') }}
          </a-radio>
        </a-radio-group>
      </div>
      <div>
        <a-form
          v-if="category === 1"
          p4
          :model="userForm"
          :rules="userRules"
          border-b
          @submit="submitUser"
        >
          <a-form-item :label="$t('person-name')" field="name">
            <a-input
              v-model="userForm.name"
              allow-clear
              style="width: 450px"
            />
          </a-form-item>

          <a-form-item :label="$t('legal.identify-number')" field="identify">
            <a-input
              v-model="userForm.identify"
              :max-length="18"
              show-word-limit
              :placeholder="$t('legal-form.placeholder.identify')"
              allow-clear
              style="width: 450px"
            />
          </a-form-item>

          <a-form-item :label="$t('legal.label.id-card-front')" field="identify_card_front">
            <a-upload
              :multiple="false"
              :limit="1"
              :file-list="[{ url: userForm.identify_card_front }].filter(i => i.url)"
              :default-file-list="[]"
              list-type="picture-card"
              image-preview
              :custom-request="(options: any) => uploadFile(options).then(url => {
                userForm.identify_card_front = url
              })"
            />
          </a-form-item>

          <a-form-item :label="$t('legal.label.id-card-reverse')" field="identify_card_reverse">
            <a-upload
              :multiple="false"
              :file-list="[{ url: userForm.identify_card_reverse }].filter(i => i.url)"
              :default-file-list="[]"
              :limit="1"
              list-type="picture-card"
              image-preview
              :custom-request="(options: any) => uploadFile(options).then(url => {
                userForm.identify_card_reverse = url
              })"
            />
          </a-form-item>

          <!-- 提交按钮 -->
          <a-form-item>
            <a-button type="primary" size="large" html-type="submit">
              {{ $t('legal.update-info') }}
            </a-button>
          </a-form-item>
        </a-form>

        <a-form
          v-if="category === 0"
          p4
          :model="corpForm"
          :rules="corpRules"
          border-b
          @submit="submitCorp"
        >
          <a-form-item :label="$t('legal.label.corp-name')" field="name">
            <a-input
              v-model="corpForm.name"
              :placeholder="$t('legal.placeholder.corp-name')"
              allow-clear
              style="width: 450px"
            />
          </a-form-item>

          <a-form-item :label="$t('legal.label.cert-number')" field="identify">
            <a-input
              v-model="corpForm.identify"
              :max-length="18"
              show-word-limit
              :placeholder="$t('legal.placeholder.corp-identify')"
              allow-clear
              style="width: 450px"
            />
          </a-form-item>

          <a-form-item :label="$t('legal.label.business-license')" field="business_license">
            <a-upload
              :multiple="false"
              :default-file-list="[]"
              :file-list="[{ url: corpForm.business_license }].filter(i => i.url)"
              :limit="1"
              list-type="picture-card"
              image-preview
              :custom-request="(options: any) => uploadFile(options).then(url => {
                corpForm.business_license = url
              })"
            />
          </a-form-item>

          <!-- 提交按钮 -->
          <a-form-item>
            <a-button type="primary" size="large" html-type="submit">
              {{ $t('legal.update-info') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-page-header>
</template>

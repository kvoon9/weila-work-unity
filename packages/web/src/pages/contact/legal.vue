<script setup lang="ts">
import type { CorpLegal, Legal, UserLegal } from '~/types/api'
import { clearUndefined } from '@antfu/utils'
import { Message } from '@arco-design/web-vue'
import * as v from 'valibot'
import { shallowRef } from 'vue'
import { useForm } from 'zod-arco-rules/valibot'

const weilaApi = useWeilaApi()

const { data, isFetched, refetch } = useWeilaFetch<Legal>('corp/legal/get-legal')

// const isVerified = computed(() => data.value?.state === 8)

const category = shallowRef(data.value?.category)
const { stop } = watch(data, (value) => {
  if (value) {
    category.value = value.category
    stop()
  }
})

const { form: userForm, rules: userRules, handleSubmit: handleUserSubmit } = useForm(v.object({
  id: v.optional(v.number(), () => (data.value as UserLegal)?.id ?? undefined),
  name: v.optional(v.string(), () => (data.value as UserLegal)?.name ?? ''),
  identify: v.optional(v.pipe(v.string(), v.length(18)), () => (data.value as UserLegal)?.identify ?? ''),
  identify_card_front: v.optional(v.string(), () => (data.value as UserLegal)?.identify_card_front ?? ''),
  identify_card_reverse: v.optional(v.string(), () => (data.value as UserLegal)?.identify_card_reverse ?? ''),
}), {
  watch: [category, data],
})

const { form: corpForm, rules: corpRules, handleSubmit: handleCorpSubmit } = useForm(v.object({
  id: v.optional(v.number(), () => (data.value as CorpLegal)?.id ?? undefined),
  name: v.optional(v.string(), () => (data.value as CorpLegal)?.name ?? ''),
  identify: v.optional(v.pipe(v.string(), v.length(18)), () => (data.value as CorpLegal)?.identify ?? ''),
  business_license: v.optional(v.string(), () => (data.value as CorpLegal)?.business_license ?? ''),
}), {
  watch: [category, data],
})

const submitUser = handleUserSubmit(async (value) => {
  const url = `corp/legal/${data.value ? 'change' : 'add'}-user-legal`
  await weilaApi.value.v2.fetch(url, {
    body: value,
  })

  Message.success('修改成功')
  refetch()
})

const submitCorp = handleCorpSubmit(async (value) => {
  const url = `corp/legal/${data.value ? 'change' : 'add'}-corp-legal`
  await weilaApi.value.v2.fetch(url, {
    body: value,
  })

  Message.success('修改成功')
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
  <a-skeleton v-if="!isFetched" :animation="true">
    <div p4 space-y-4>
      <a-skeleton-line :rows="1" :widths="[120]" />
      <a-skeleton-line :rows="1" :widths="['100%']" />
      <a-skeleton-line :rows="1" :widths="['100%']" />
      <a-skeleton-line :rows="1" :widths="[200]" />
    </div>
  </a-skeleton>
  <div v-else>
    <div p4 border-b>
      <a-descriptions
        v-if="data"
        :title="data.category === 0 ? '企业认证' : '个人认证'" size="large"
        bordered
        :data="[
          {
            label: '审核状态',
            value: data.state === 8
              ? '已通过'
              : data.state === 9
                ? '未通过'
                : '待审核',
          },
          {
            label: '认证类别',
            value: data.category === 0 ? '企业' : '个人',
          },
          {
            label: '机构名称',
            value: data.name,
          },
          {
            label: '证件号码',
            value: data.identify,
          },
          {
            label: '更新时间',
            value: data.updated,
          },
        ]"
      />
    </div>

    <div p4 border-b>
      <a-radio-group v-model="category" type="button">
        <a-radio :value="0">
          企业认证
        </a-radio>
        <a-radio v-if="data?.category !== 0" :value="1">
          个人认证
        </a-radio>
      </a-radio-group>
    </div>

    <a-form
      v-if="category === 1"
      p4
      :model="userForm"
      :rules="userRules"
      layout="vertical"
      border-b
      @submit="submitUser"
    >
      <a-form-item label="姓名" field="name">
        <a-input
          v-model="userForm.name"
          placeholder="请输入姓名"
          allow-clear
          style="width: 450px"
        />
      </a-form-item>

      <a-form-item label="证件号码" field="identify">
        <a-input
          v-model="userForm.identify"
          :max-length="18"
          show-word-limit
          placeholder="请输入 18 位统一社会信用代码或身份证号"
          allow-clear
          style="width: 450px"
        />
      </a-form-item>

      <a-form-item label="身份证正面" field="identify_card_front">
        <a-upload
          :multiple="false"
          :limit="1"
          :file-list="clearUndefined([{ url: userForm.identify_card_front }])"
          list-type="picture-card"
          image-preview
          :custom-request="(options: any) => uploadFile(options).then(url => {
            userForm.identify_card_front = url
          })"
        />
      </a-form-item>

      <a-form-item label="身份证反面" field="identify_card_reverse">
        <a-upload
          :multiple="false"
          :file-list="clearUndefined([{ url: userForm.identify_card_reverse }])"
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
        <a-button mla type="primary" size="large" html-type="submit">
          更新认证信息
        </a-button>
      </a-form-item>
    </a-form>

    <a-form
      v-if="category === 0"
      p4
      :model="corpForm"
      :rules="corpRules"
      layout="vertical"
      border-b
      @submit="submitCorp"
    >
      <a-form-item label="企业名称" field="name">
        <a-input
          v-model="corpForm.name"
          placeholder="请输入企业名称"
          allow-clear
          style="width: 450px"
        />
      </a-form-item>

      <a-form-item label="证件号码" field="identify">
        <a-input
          v-model="corpForm.identify"
          :max-length="18"
          show-word-limit
          placeholder="请输入营业执照代码"
          allow-clear
          style="width: 450px"
        />
      </a-form-item>

      <a-form-item label="营业执照" field="business_license">
        <a-upload
          :multiple="false"
          :file-list="clearUndefined([{ url: corpForm.business_license }])"
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
        <a-button mla type="primary" size="large" html-type="submit">
          更新认证信息
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

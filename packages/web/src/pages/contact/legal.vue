<script setup lang="ts">
import { clearUndefined } from '@antfu/utils'
import { Message } from '@arco-design/web-vue'
import * as v from 'valibot'
import { useForm } from '~/composables/useForm'
import { useMyLegal } from '~/composables/useMyLegal'

const weilaApi = useWeilaApi()
const { data, isFetched, refetch } = useMyLegal()

interface Form {
  id?: number
  category: number
  identify: string
  identify_card_front: string
  identify_card_reverse: string
  business_license: string
}

const { form, rules, handleSubmit } = useForm<Form>({
  id: { value: undefined },
  category: {
    value: 0,
  },
  identify: {
    value: '',
    rule: v.pipe(v.string(), v.length(18)),
  },
  identify_card_front: {
    value: '',
  }, // img
  identify_card_reverse: {
    value: '',
  }, // img
  business_license: {
    value: '',
  }, // img
}, {
  defaultSource: data,
})

const submit = handleSubmit(async (value) => {
  await weilaApi.value.v2.fetch(`corp/legal/${data.value ? 'change' : 'add'}-${form.value.category === 0 ? 'corp' : 'user'}-legal`, {
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

            label: '更新时间',
            value: data.updated,
          },
        ]"
      />
    </div>

    <a-form
      p4
      :model="form"
      :rules="rules"
      layout="vertical"
      border-b
      @submit="submit"
    >
      <a-form-item label="认证类别" field="category">
        <a-radio-group v-model="form.category" type="button">
          <a-radio :value="0">
            企业认证
          </a-radio>
          <a-radio v-if="!data || data.category === 1 || data.state !== 8" :value="1">
            个人认证
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        label="证件号码"
        field="identify"
        :rules="rules.identify"
      >
        <a-input
          v-model="form.identify"
          :max-length="18"
          show-word-limit
          :placeholder="form.category === 0 ? '请输入营业执照代码' : '请输入 18 位统一社会信用代码或身份证号'"
          allow-clear
          style="width: 450px"
        />
      </a-form-item>

      <a-form-item
        v-if="form.category === 1"
        label="身份证正面" field="identify_card_front"
      >
        <a-upload
          :multiple="false"
          :limit="1"
          :file-list="clearUndefined([{ url: form.identify_card_front }])"
          list-type="picture-card"
          image-preview
          :custom-request="(options: any) => uploadFile(options).then(url => {
            form.identify_card_front = url
          })"
        />
      </a-form-item>

      <a-form-item
        v-if="form.category === 1"
        label="身份证反面" field="identify_card_reverse"
      >
        <a-upload
          :multiple="false"
          :file-list="clearUndefined([{ url: form.identify_card_reverse }])"
          :limit="1"
          list-type="picture-card"
          image-preview
          :custom-request="(options: any) => uploadFile(options).then(url => {
            form.identify_card_reverse = url
          })"
        />
      </a-form-item>

      <a-form-item
        v-if="form.category === 0"
        label="营业执照"
        field="business_license"
      >
        <a-upload
          :multiple="false"
          :file-list="clearUndefined([{ url: form.business_license }])"
          :limit="1"
          list-type="picture-card"
          image-preview
          :custom-request="(options: any) => uploadFile(options).then(url => {
            form.business_license = url
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

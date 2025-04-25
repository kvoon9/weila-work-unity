<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useChangeLegal, useServiceLegal } from '@weila/network'
import { reactive, shallowRef } from 'vue'
import FileUploader from '~/components/FileUploader.vue'

const { t } = useI18n()

const isUploadingFile = shallowRef(false)

const { data: legalData, refetch: refetchLegalData } = useServiceLegal($v2)
const { mutateAsync: changeLegal, isPending } = useChangeLegal($v2, {
  onSuccess() {
    Message.success('修改成功')
    refetchLegalData()
  },
})

const form = reactive({
  business_license: '',
})

watchEffect(() => {
  if (legalData.value) {
    form.business_license = legalData.value?.merchant.business_license || ''
    console.log('form', form)
  }
})

function handleSave() {
  changeLegal({
    legal: {
      id: legalData?.value?.id || 0,
      type: legalData?.value?.type || 0,
      merchant: {
        business_license: form.business_license,
      },
    },
  })
}
</script>

<template>
  <div p4 space-y-4>
    <a-breadcrumb>
      <RouterLink to="/workbench">
        <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
      </RouterLink>
      <a-breadcrumb-item>修改认证信息</a-breadcrumb-item>
    </a-breadcrumb>
    <div p4 bg-base>
      <a-form :model="form">
        <a-form-item field="business_license" label="营业执照">
          <div w-80>
            <FileUploader
              v-model:is-uploading="isUploadingFile"
              :limit="1"
              classes="bg-neutral-200 dark:bg-neutral-800" w-full
              :initial-files="form.business_license"
              @update:files="(files) => form.business_license = files[0]"
            />
          </div>
        </a-form-item>
        <a-form-item>
          <a-button
            :disabled="isPending"
            :loading="isPending"
            type="primary"
            @click="handleSave"
          >
            保存
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

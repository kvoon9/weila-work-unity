<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useChangeLegal, useServiceLegal } from '@weila/network'
import { reactive, shallowRef } from 'vue'
import FileUploader from '~/components/FileUploader.vue'

const { t } = useI18n()

const adtStateMap = {
  0: '待审核',
  8: '审核通过',
  9: '审核未通过',
}

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
  if (legalData.value)
    form.business_license = legalData.value?.merchant.business_license || ''
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
      <div>
        <div my4 text-2xl leading-loose>
          认证信息
        </div>

        <div mb-4 w-full flex rounded bg-neutral-100 p-4 space-x-4 dark:bg-neutral-900>
          <div>
            <!-- <div class="mb-2 font-medium text-base">
              营业执照
            </div> -->

            <FileUploader
              v-model:is-uploading="isUploadingFile"
              :limit="1"
              style="grid-template-columns: 1fr !important;"
              w-40 classes="bg-neutral-200 dark:bg-neutral-800"
              :initial-files="form.business_license"
              @update:files="(files) => form.business_license = files[0]"
            />
          </div>

          <div>
            <div class="mb-2 flex">
              <div class="info-label w-20 text-neutral-500">
                ID：
              </div>
              <div class="info-value font-medium">
                {{ legalData?.id || '-' }}
              </div>
            </div>
            <div class="mb-2 flex">
              <div class="info-label w-20 text-neutral-500">
                类型：
              </div>
              <div class="info-value font-medium">
                {{ legalData?.type || '-' }}
              </div>
            </div>
            <div class="flex">
              <div class="info-label w-20 text-neutral-500">
                状态：
              </div>
              <div
                class="info-value font-medium"
                :class="{
                  'color-green': legalData?.state === 8,
                  'color-red': legalData?.state === 9,
                  'color-orange': legalData?.state === 0,
                }"
              >
                {{ adtStateMap[legalData?.state ?? 0] }}
              </div>
            </div>
          </div>
        </div>

        <div mt-6 flex items-center justify-end>
          <a-button :loading="isPending" type="primary" :disabled="isPending || isUploadingFile" @click="handleSave">
            提交
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChangeBusinessPayload } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { useMutateBusiness, useMyBusiness } from '@weila/network'
import { reactive, shallowRef } from 'vue'

const { t } = useI18n()

const isEditBusinessModalOpen = shallowRef(false)

const { data: businessData, refetch: refetchBusinessData } = useMyBusiness($v2)
const { mutateAsync: changeBusiness, isPending: isChangingBusiness } = useMutateBusiness($v2, {
  onSuccess() {
    isEditBusinessModalOpen.value = false
    Message.success('修改成功')
    refetchBusinessData()
  },
})

const form = reactive<ChangeBusinessPayload['business']['merchant']>({
  name: businessData.value?.merchant?.name || '',
  phone: businessData.value?.merchant?.phone || '',
  album: businessData.value?.merchant?.album || [],
  intro: businessData.value?.merchant?.intro || '',
  address: businessData.value?.merchant?.address || '',
  lon: businessData.value?.merchant?.lon || 0,
  lat: businessData.value?.merchant?.lat || 0,
  adcode: businessData.value?.merchant?.adcode || '',
  // type: businessData.value?.merchant?.type || 0,
  avatar: businessData.value?.merchant?.avatar || '',
  citycode: businessData.value?.merchant?.citycode || '',
  township: businessData.value?.merchant?.township || '',
})

const isUploadingAlbum = shallowRef(false)
</script>

<template>
  <TheModal
    v-model:open="isEditBusinessModalOpen"
    title="编辑服务号信息"
  >
    <a-button type="primary">
      编辑
    </a-button>
    <template #content>
      <a-form :model="form">
        <a-form-item field="name" :label="t('org-form.name.label')">
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item field="phone" label="电话">
          <a-input v-model="form.phone" :max-length="13" show-word-limit />
        </a-form-item>
        <a-form-item field="intro" label="简介">
          <a-textarea v-model="form.intro" :rows="3" />
        </a-form-item>
        <a-form-item field="phone" label="业务展示">
          <FileUploader
            v-model:is-uploading="isUploadingAlbum"
            classes="bg-neutral-200 dark:bg-neutral-800" w-full
            :initial-files="form.album" @update:files="(files) => form.album = files"
          />
        </a-form-item>
        <a-form-item field="address" label="位置">
          <TheModal title="选择位置">
            <a-button>
              TODO: {{ businessData?.merchant?.address }}
            </a-button>
            <template #content>
              <div h80vh w80vw>
                <MapPicker
                  @update:value="(value) => {
                    form.lon = value.lon
                    form.lat = value.lat
                    form.adcode = value.adcode
                    form.address = value.Address
                    form.citycode = value.citycode
                    form.township = value.township
                  }"
                />
              </div>
            </template>
          </TheModal>
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-button
        :disabled="isChangingBusiness"
        :loading="isChangingBusiness"
        type="primary" @click="() => changeBusiness({
          business: {
            ...businessData!,
            merchant: {
              ...businessData!.merchant,
              ...form,
            },
          },
        })"
      >
        保存
      </a-button>
    </template>
  </TheModal>
</template>

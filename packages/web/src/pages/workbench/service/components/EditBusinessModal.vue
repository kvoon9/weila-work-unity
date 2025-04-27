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
const avatarUploaderRef = templateRef('avatarUploaderRef')
const isMapPickerModalOpen = shallowRef(false)

// 检查图片是否为远程图片
function isRemoteImage(url: string) {
  return url && (url.startsWith('http://') || url.startsWith('https://'))
}

// 处理提交
async function handleSubmit() {
  // 如果头像不是远程图片，需要先上传
  if (form.avatar && !isRemoteImage(form.avatar)) {
    // @ts-expect-error type error: `defineExpose` no type declare find
    const { upload } = avatarUploaderRef.value
    if (upload) {
      await upload()
    }
  }

  // 确保 businessData 存在
  if (!businessData.value)
    return

  changeBusiness({
    business: {
      ...businessData.value,
      merchant: {
        ...businessData.value.merchant,
        ...form,
      },
    },
  })
}
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
        <a-form-item field="avatar" label="头像">
          <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
        </a-form-item>
        <a-form-item field="phone" label="业务展示">
          <FileUploader
            v-model:is-uploading="isUploadingAlbum"
            w-120
            classes="bg-neutral-200 dark:bg-neutral-800"
            :initial-files="form.album" @update:files="(files) => form.album = files"
          />
        </a-form-item>
        <a-form-item field="address" label="位置">
          <TheModal v-model:open="isMapPickerModalOpen" title="选择位置">
            <a-button>
              <span max-w-60 truncate>{{ form?.address }}</span>
              <i i-carbon-location-filled mx2 />
            </a-button>
            <template #content>
              <div h80vh w80vw>
                <MapPicker
                  :options="{
                    center: form.lon && form.lat ? [form.lon, form.lat] : undefined,
                  }"
                  @update:value="(value) => {
                    form.lon = value.lon
                    form.lat = value.lat
                    form.adcode = value.adcode
                    form.address = value.Address
                    form.citycode = value.citycode
                    form.township = value.township
                    isMapPickerModalOpen = false
                    console.log('value', value)
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
        type="primary"
        @click="handleSubmit"
      >
        保存
      </a-button>
    </template>
  </TheModal>
</template>

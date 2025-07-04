<script setup lang="ts">
import type { CreateBusinessPayload } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { createBusiness } from '@weila/network'
import { reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AvatarUploader from '~/components/AvatarUploader.vue'
import FileUploader from '~/components/FileUploader.vue'
import { isRemoteImage } from '~/utils/is'

const isCreateBusinessModalOpen = shallowRef(false)
const { mutateAsync: create, isPending: isCreating } = createBusiness($v2, {
  onSuccess() {
    isCreateBusinessModalOpen.value = false
    Message.success('创建成功')
    // useMyBusiness($v2).refetch()
    // useServiceLegal($v2).refetch()
  },
})

const { t } = useI18n()

const form = reactive<CreateBusinessPayload>({
  merchant: {
    type: 256,
    name: '',
    phone: '',
    avatar: '',
    album: [],
    intro: '',
    address: '',
    lon: 0,
    lat: 0,
    adcode: '',
    citycode: '',
    township: '',
  },
  type: 0,
})

const avatarUploaderRef = shallowRef(null)
const isUploadingAlbum = shallowRef(false)
const isMapPickerModalOpen = shallowRef(false)

function handleCreate() {
  // 上传头像
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.merchant.avatar && !isRemoteImage(form.merchant.avatar)) {
    console.log('form', form)
    return upload().then(() => create(form))
  }

  return create(form)
}
</script>

<template>
  <TheModal
    v-model:open="isCreateBusinessModalOpen"
    title="创建服务号"
  >
    <template #content>
      <a-form :model="form">
        <a-form-item :label="t('org-form.name.label')" field="name">
          <a-input v-model="form.merchant.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item label="电话" field="phone">
          <a-input v-model="form.merchant.phone" :max-length="11" show-word-limit />
        </a-form-item>
        <a-form-item label="简介" field="intro">
          <a-textarea v-model="form.merchant.intro" :rows="3" />
        </a-form-item>
        <a-form-item label="头像" field="avatar">
          <AvatarUploader ref="avatarUploaderRef" v-model:src="form.merchant.avatar" />
        </a-form-item>
        <a-form-item label="业务展示" field="album">
          <FileUploader
            v-model:is-uploading="isUploadingAlbum"
            w-120
            classes="bg-neutral-200 dark:bg-neutral-800"
            :initial-files="form.merchant.album" @update:files="(files) => form.merchant.album = files"
          />
        </a-form-item>
        <a-form-item label="位置" field="address">
          <TheModal v-model:open="isMapPickerModalOpen" title="选择位置">
            <a-button>
              <span max-w-60 truncate>{{ form.merchant?.address || '选择位置' }}</span>
              <i i-carbon-location-filled mx2 />
            </a-button>
            <template #content>
              <div h80vh w80vw>
                <MapPicker
                  @update:value="(value) => {
                    form.merchant.lon = value.lon
                    form.merchant.lat = value.lat
                    form.merchant.adcode = value.adcode
                    form.merchant.citycode = value.citycode || ''
                    form.merchant.address = value.Address
                    form.merchant.township = value.township || ''
                    isMapPickerModalOpen = false
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
        :disabled="isCreating"
        :loading="isCreating"
        type="primary"
        @click="handleCreate"
      >
        保存
      </a-button>
    </template>
  </TheModal>
</template>

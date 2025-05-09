<script setup lang="ts">
import type { CreateBusinessPointPayload } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { useRouteParams } from '@vueuse/router'
import { createBusinessPoint, useBusinessPointList } from '@weila/network'
import { reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AvatarUploader from '~/components/AvatarUploader.vue'
import FileUploader from '~/components/FileUploader.vue'
import { isRemoteImage } from '~/utils/is'

const sid = useRouteParams('sid', 0, { transform: Number })

const isCreateBusinessPointModalOpen = shallowRef(false)
const { mutateAsync: create, isPending: isCreating } = createBusinessPoint($v2, {
  onSuccess() {
    isCreateBusinessPointModalOpen.value = false
    Message.success('创建成功')
    useBusinessPointList($v2, { sid: sid.value }).refetch()
  },
})

const { t } = useI18n()

const form = reactive<CreateBusinessPointPayload>({
  sid: sid.value,
  name: '',
  phone: '',
  album: [],
  intro: '',
  address: '',
  lon: 0,
  lat: 0,
  adcode: '',
  avatar: '',
})

const avatarUploaderRef = shallowRef(null)
const isUploadingAlbum = shallowRef(false)
const isMapPickerModalOpen = shallowRef(false)

function handleCreate() {
  // 上传头像
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (form.avatar && !isRemoteImage(form.avatar)) {
    return upload().then(() => create(form))
  }

  return create(form)
}
</script>

<template>
  <TheModal
    v-model:open="isCreateBusinessPointModalOpen"
    title="创建服务点"
  >
    <a-button type="primary">
      创建服务点
    </a-button>
    <template #content>
      <a-form :model="form">
        <a-form-item :label="t('org-form.name.label')" field="name">
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item label="电话" field="phone">
          <a-input v-model="form.phone" :max-length="13" show-word-limit />
        </a-form-item>
        <a-form-item label="简介" field="intro">
          <a-textarea v-model="form.intro" :rows="3" />
        </a-form-item>
        <a-form-item label="头像" field="avatar">
          <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
        </a-form-item>
        <a-form-item label="业务展示" field="album">
          <FileUploader
            v-model:is-uploading="isUploadingAlbum"
            w-120
            classes="bg-neutral-200 dark:bg-neutral-800"
            :initial-files="form.album" @update:files="(files) => form.album = files"
          />
        </a-form-item>
        <a-form-item label="位置" field="address">
          <TheModal v-model:open="isMapPickerModalOpen" title="选择位置">
            <a-button>
              <span max-w-60 truncate>{{ form?.address || '选择位置' }}</span>
              <i i-carbon-location-filled mx2 />
            </a-button>
            <template #content>
              <div h80vh w80vw>
                <MapPicker
                  @update:value="(value) => {
                    form.lon = value.lon
                    form.lat = value.lat
                    form.adcode = value.adcode
                    form.address = value.Address
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

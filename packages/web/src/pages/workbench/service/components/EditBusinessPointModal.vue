<script setup lang="ts">
import type { GetBusinessPointListModel } from '@weila/network'
import Message from '@arco-design/web-vue/es/message'
import { changeBusinessPoint, useBusinessPointList } from '@weila/network'
import { ref as deepRef, shallowRef } from 'vue'
import AvatarUploader from '~/components/AvatarUploader.vue'
import FileUploader from '~/components/FileUploader.vue'
import MapPicker from '~/components/MapPicker.vue'
import { isRemoteImage } from '~/utils/is'

const props = defineProps<{
  point: GetBusinessPointListModel['points'][number]
}>()

const isEditBusinessPointModalOpen = defineModel<boolean>('open', { required: true })

const form = deepRef(props.point)
const avatarUploaderRef = templateRef('avatarUploaderRef')

watchImmediate(() => props.point, () => {
  form.value = JSON.parse(JSON.stringify(props.point))
})

const isUploadingAlbum = shallowRef(false)
const isMapPickerModalOpen = shallowRef(false)

const { mutateAsync, isPending: isChangingBusinessPoint } = changeBusinessPoint($v2, {
  onSuccess() {
    isEditBusinessPointModalOpen.value = false
    Message.success('修改成功')
    useBusinessPointList($v2, { sid: props.point.sid }).refetch()
  },
})

async function handleSubmit() {
  // @ts-expect-error type error: `defineExpose` no type declare find
  const { upload } = avatarUploaderRef.value
  if (upload && form.value.avatar && !isRemoteImage(form.value.avatar)) {
    await upload()
  }

  mutateAsync({ ...form.value })
}
</script>

<template>
  <TheModal v-model:open="isEditBusinessPointModalOpen" title="编辑服务点">
    <template #content>
      <a-form :model="form">
        <a-form-item field="name" label="名称">
          <a-input v-model="form.name" :max-length="50" show-word-limit />
        </a-form-item>
        <a-form-item field="phone" label="电话">
          <a-input v-model="form.phone" :max-length="11" show-word-limit />
        </a-form-item>
        <a-form-item field="avatar" label="头像">
          <AvatarUploader ref="avatarUploaderRef" v-model:src="form.avatar" />
        </a-form-item>
        <a-form-item field="intro" label="简介">
          <a-textarea v-model="form.intro" :rows="3" />
        </a-form-item>
        <a-form-item field="album" label="业务展示">
          <FileUploader
            v-model:is-uploading="isUploadingAlbum"
            w-120
            classes="bg-neutral-200 dark:bg-neutral-800"
            :initial-files="form.album"
            @update:files="(files: string[]) => form.album = files"
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
                    center: [form.lon, form.lat],
                  }"
                  @update:value="(value: any) => {
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
        :disabled="isChangingBusinessPoint || isUploadingAlbum"
        :loading="isChangingBusinessPoint"
        type="primary"
        @click="handleSubmit"
      >
        保存
      </a-button>
    </template>
  </TheModal>
</template>

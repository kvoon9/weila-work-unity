<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { UseImage } from '@vueuse/components'
import { defineEmits } from 'unplugin-vue-macros/macros'
import { shallowRef } from 'vue'

import TheCropper from '~/components/TheCropper.vue'

const emits = defineEmits<{
  uploading: (precent: number) => void
}>()
const src = defineModel('src', { default: '' })
const { t } = useI18n()

const compressedFile = shallowRef<Blob | null>(null)
const isCropperModalVisible = shallowRef(false)

const isSupported = shallowRef(true)
const { files, open, onChange } = useFileDialog({
  accept: 'image/*',
  reset: true,
})

const file = computed(() => files.value?.[0])

onChange(() => {
  isCropperModalVisible.value = true
})

const weilaApi = useWeilaApi()

function upload() {
  if (!compressedFile.value)
    return

  const formData = new FormData()
  formData.append('file', compressedFile.value)

  return weilaApi.value.v2.request.post<string>('common/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: any) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        emits('uploading', percent)
      }
    },
  })
    .then(url => src.value = url)
    .catch((error) => {
      console.error('error', error)
      Message.error((error as Error)?.message || String(error))
    })
}

async function onSave(file: File) {
  isCropperModalVisible.value = false

  src.value = URL.createObjectURL(file)
  compressedFile.value = file
}

defineExpose({
  upload,
})
</script>

<template>
  <div v-if="isSupported" cursor-pointer @click="() => open()">
    <UseImage v-if="src" :src="src" alt="upload avatar" class="mb-2 h-20 w-20 rounded object-cover">
      <template #loading>
        <div class="h-20 w-20 animate-pulse rounded bg-gray-200" />
      </template>
      <template #error>
        <div class="h-20 w-20 flex items-center justify-center rounded bg-gray-300">
          <i i-carbon-image class="text-3xl text-gray-500" />
        </div>
      </template>
    </UseImage>
    <div v-else flex="~ center" rounded bg-gray:20 size-20>
      <i i-carbon-add inline-block size-14 />
    </div>
  </div>
  <div v-else>
    <div class="mb-2 h-20 w-20 flex items-center justify-center rounded bg-gray-300">
      <i i-carbon-warning class="text-3xl text-gray-500" />
    </div>
    <p class="text-sm text-gray-500">
      {{ t('not-supported') }}
    </p>
  </div>

  <a-modal v-model:visible="isCropperModalVisible" :footer="false" :title=" t('crop.avatar') ">
    <!-- @vue-expect-error type error -->
    <TheCropper v-if="file" :file="file" @save="onSave" />
    <div v-else>
      {{ t('no-data') }}
    </div>
  </a-modal>
</template>

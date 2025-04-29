<script setup lang="ts">
import { toArray } from '@antfu/utils'
import { ImagePreview } from '@arco-design/web-vue'
import Message from '@arco-design/web-vue/es/message'
import { useFileDialog } from '@vueuse/core'
import { toFileWrapper, useUploadFile } from '@weila/network'
import { computed, ref as deepRef, shallowRef, watch } from 'vue'
import { $weilaRequestV2 } from '~/utils/api'
import TheCropper from './TheCropper.vue'

const props = defineProps<{
  classes?: string | string[]
  limit?: number
  initialFiles?: string | string[]
  corpper?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:files', files: string[]): void
  (e: 'error', error: unknown): void
}>()

const isUploading = defineModel<boolean>('isUploading', { required: false })

const initialFiles = computed(() => toArray(props.initialFiles))

const { files, open } = useFileDialog({
  accept: 'image/*',
})

const { mutateAsync: uploadFile, filelist } = useUploadFile($weilaRequestV2)

$inspect(filelist.value)

filelist.value.push(...initialFiles.value.map(toFileWrapper))

const isCropperModalVisible = shallowRef(false)
const unCroppedFiles = deepRef<File[]>([])

watch(files, async (newValue) => {
  if (!newValue)
    return

  unCroppedFiles.value = Array.from(newValue)

  // TODO: cropper multi file is not implemented
  if (unCroppedFiles.value.length > 1) {
    console.error('TODO: cropper multi file is not implemented')
    Message.error('TODO: cropper multi file is not implemented')
    return
  }

  isCropperModalVisible.value = true
  isCropperModalVisible.value = true
})

async function onSave(file: File) {
  Message.success('压缩成功')
  isCropperModalVisible.value = false

  const [_, ...rest] = unCroppedFiles.value
  unCroppedFiles.value = rest

  if (unCroppedFiles.value.length > 0)
    isCropperModalVisible.value = true

  isUploading.value = true

  await uploadFile(file)
  emits('update:files', filelist.value.map(f => f.url || f.dataUrl))
  // toast('上传成功')
  isUploading.value = false
}

const uploadStateIconMap = {
  pending: 'i-svg-spinners-90-ring',
  success: 'i-ph-check-fat-fill',
  error: 'i-ph-warning-fill',
}

// @unocss-include
const uploadStateClassMap = {
  pending: 'color-secondary',
  success: 'hidden',
  error: 'color-red',
}

const viewerVisible = shallowRef(false)
const currentImage = shallowRef<string>('')

function handlePreview(file: { url?: string, dataUrl?: string }) {
  currentImage.value = file.url || file.dataUrl || ''
  viewerVisible.value = true
}

defineExpose({
  filelist,
})
</script>

<template>
  <div id="root" grid="~ gap4 cols-3">
    <div v-for="(file, index) in filelist" :key="index" :class="classes" class="relative aspect-square overflow-hidden rounded-md">
      <img :src="file.url || file.dataUrl" class="file-uploader-image-item h-full w-full object-cover" @click="() => handlePreview(file)">

      <i
        :class="[
          uploadStateClassMap[file.state],
          uploadStateIconMap[file.state],
        ]" absolute bottom-2 right-2 rounded-full color-primary size-4
      />

      <button
        type="button" absolute right-2 top-2 flex items-center rounded-full bg-white:50 @click="() => {
          filelist.splice(index, 1)
          emits('update:files', filelist.map(f => f.url || f.dataUrl))
        }"
      >
        <i i-carbon-close inline-block rounded-full bg-black size-8 />
      </button>
    </div>

    <div
      v-if="filelist.length < (limit || 9)"
      :class="{ ...toArray(classes) }"
      class="aspect-square flex cursor-pointer items-center justify-center rounded-md bg-neutral-200 dark:bg-neutral-800"
      @click="() => open()"
    >
      <i i-ph-plus size-6 />
    </div>
    <DialogRoot v-model:open="isCropperModalVisible">
      <DialogPortal>
        <DialogOverlay class="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30 backdrop-blur" />
        <DialogContent
          class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
        >
          <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
            裁剪图片
          </DialogTitle>
          <DialogDescription class="text-mauve11 mb-5 mt-[10px] text-sm leading-normal">
            裁剪图片尺寸
          </DialogDescription>
          <!-- @vue-expect-error type error  -->
          <TheCropper
            class="max-h-96"
            :file="unCroppedFiles[0]"
            :cropper="{
              aspectRatio: 16 / 9,
            }"
            :image-compression="{
              maxSizeMB: 5,
            }"
            @save="onSave"
          />
          <DialogClose
            class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-green4 focus:shadow-[0_0_0_2px] focus:shadow-green7 focus:outline-none"
            aria-label="Close"
          >
            <i i-lucide-x />
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
    <ImagePreview v-model:visible="viewerVisible" z-9999 :src="currentImage" />
  </div>
</template>

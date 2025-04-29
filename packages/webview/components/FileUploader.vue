<script setup lang="ts">
import { toArray } from '@antfu/utils'
import { toFileWrapper, useUploadFile } from '@weila/network'
import Viewer from 'viewerjs'
import { ref as deepRef, shallowRef } from 'vue'

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

const { toast } = useToast()

const initialFiles = computed(() => toArray(props.initialFiles))

const { files, open } = useFileDialog({
  accept: 'image/*',
})

const { mutateAsync: uploadFile, filelist } = useUploadFile($weilaRequestV2)

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
    toast('TODO: cropper multi file is not implemented')
    return
  }

  isCropperModalVisible.value = true
  isCropperModalVisible.value = true
})

async function onSave(file: File) {
  toast('压缩成功')
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
  pending: 'svg-spinners:90-ring',
  success: 'ph:check-fat-fill',
  error: 'ph:warning-fill',
}

// @unocss-include
const uploadStateClassMap = {
  pending: 'color-secondary',
  success: 'hidden',
  error: 'color-red',
}

let viewer: Viewer | null = null

function handlePreview() {
  const images = document.querySelector<HTMLDivElement>('#root')
  if (images) {
    viewer?.destroy()

    viewer = new Viewer(images, {
      inline: false,
    })
  }
}

defineExpose({
  filelist,
})
</script>

<template>
  <div id="root" class="w-full" grid="~ cols-3 gap4">
    <div v-for="(file, index) in filelist" :key="index" :class="classes" class="aspect-square h-25vw relative overflow-hidden rounded-md">
      <img :src="file.url || file.dataUrl" class="file-uploader-image-item w-full h-full object-cover" @click="handlePreview">

      <Icon :class="uploadStateClassMap[file.state]" :name="uploadStateIconMap[file.state]" size-4 absolute right-2 bottom-2 color-primary rounded-full />

      <button
        type="button" absolute top-2 right-2 bg-white rounded-full @click="() => {
          filelist.splice(index, 1)
          emits('update:files', filelist.map(f => f.url || f.dataUrl))
        }"
      >
        <Icon name="ph:x" size-4 rounded-full />
      </button>
    </div>

    <div
      v-if="filelist.length < (limit || 9)"
      :class="classes"
      class="aspect-square h-25vw flex items-center justify-center rounded-md bg-secondary cursor-pointer"
      @click="() => open()"
    >
      <Icon size-6 name="ph:plus" />
    </div>
    <Teleport to="body">
      <DialogRoot v-model:open="isCropperModalVisible">
        <DialogTrigger />
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              裁剪图片
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
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
              class="text-grass11 hover:bg-green4 focus:shadow-green7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
              <Icon name="lucide:x" />
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </Teleport>
  </div>
</template>

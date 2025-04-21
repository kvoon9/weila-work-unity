<script setup lang="ts">
import { toArray } from '@antfu/utils'
import Message from '@arco-design/web-vue/es/message'
import { useFileDialog } from '@vueuse/core'
// import Viewer from 'viewerjs'
import { ref as deepRef, shallowRef } from 'vue'
import { weilaRequest } from '~/api/instances/request'
import TheCropper from '~/components/TheCropper.vue'

const props = defineProps<{
  classes?: string | string[]
  limit?: number
  initialFiles?: string | string[]
  cropper?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:files', files: string[]): void
  (e: 'error', error: unknown): void
}>()

const isUploading = defineModel<boolean>('isUploading', { required: false })

const { t } = useI18n()

const initialFiles = computed(() => toArray(props.initialFiles))

const { files, open } = useFileDialog({
  accept: 'image/*',
})

// 文件上传相关状态
interface FileWrapper {
  url?: string
  dataUrl?: string
  file?: File
  state: 'pending' | 'success' | 'error'
}

const filelist = ref<FileWrapper[]>([])

// 初始化初始文件列表
filelist.value.push(...initialFiles.value.map(url => ({
  url,
  state: 'success' as const,
})))

// 上传文件
async function uploadFile(file: File): Promise<void> {
  const fileWrapper: FileWrapper = {
    file,
    dataUrl: URL.createObjectURL(file),
    state: 'pending',
  }

  filelist.value.push(fileWrapper)

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await weilaRequest.post<{ url: string }>('/corp/web/file-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data?.url) {
      fileWrapper.url = response.data.url
      fileWrapper.state = 'success'
    }
    else {
      throw new Error(`${response.errcode} ${response.errmsg}`)
    }
  }
  catch (error) {
    fileWrapper.state = 'error'
    emits('error', error)
    Message.error((error as Error)?.message || String(error))
  }
}

// 裁剪相关
const isCropperModalVisible = shallowRef(false)
const unCroppedFiles = deepRef<File[]>([])

watch(files, async (newValue) => {
  if (!newValue)
    return

  if (props.cropper) {
    unCroppedFiles.value = Array.from(newValue)

    // 多文件裁剪暂不支持
    if (unCroppedFiles.value.length > 1) {
      console.error('多文件裁剪暂不支持')
      Message.warning('多文件裁剪暂不支持')
      return
    }

    isCropperModalVisible.value = true
  }
  else {
    // 如果不需要裁剪，直接上传文件
    isUploading.value = true

    for (const file of Array.from(newValue)) {
      await uploadFile(file)
    }

    emits('update:files', filelist.value.map(f => f.url || f.dataUrl || '').filter(Boolean))
    isUploading.value = false
  }
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
  emits('update:files', filelist.value.map(f => f.url || f.dataUrl || '').filter(Boolean))
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

// 删除文件
function handleRemoveFile(index: number) {
  filelist.value.splice(index, 1)
  emits('update:files', filelist.value.map(f => f.url || f.dataUrl || '').filter(Boolean))
}

defineExpose({
  filelist,
  open,
})
</script>

<template>
  <div id="root" class="w-full" grid="~ cols-3 gap4">
    <div
      v-for="(file, index) in filelist"
      :key="index"
      :class="classes"
      class="relative aspect-square h-25vw overflow-hidden rounded-md"
    >
      <img
        :src="file.url || file.dataUrl"
        class="file-uploader-image-item h-full w-full object-cover"
        @click="handlePreview"
      >

      <Icon
        :class="uploadStateClassMap[file.state]"
        :name="uploadStateIconMap[file.state]"

        absolute bottom-2 right-2 rounded-full color-primary size-4
      />

      <button
        type="button"

        absolute right-2 top-2 rounded-full bg-white
        @click="() => handleRemoveFile(index)"
      >
        <Icon name="ph:x" rounded-full size-4 />
      </button>
    </div>

    <div
      v-if="filelist.length < (limit || 9)"
      :class="classes"
      class="bg-secondary aspect-square h-25vw flex cursor-pointer items-center justify-center rounded-md"
      @click="() => open()"
    >
      <Icon size-6 name="ph:plus" />
    </div>

    <Teleport to="body">
      <DialogRoot v-model:open="isCropperModalVisible">
        <DialogTrigger />
        <DialogPortal>
          <DialogOverlay class="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30 backdrop-blur" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              {{ t('裁剪图片') }}
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
              @save="onSave"
            />
            <DialogClose
              class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-green4 focus:shadow-[0_0_0_2px] focus:shadow-green7 focus:outline-none"
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

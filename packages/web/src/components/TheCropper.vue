<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { computedAsync } from '@vueuse/core'
import imageCompression from 'browser-image-compression'
import Cropper from 'cropperjs'
import { defineEmits } from 'unplugin-vue-macros/macros'
import { shallowRef } from 'vue'

const props = defineProps<{
  file: Blob | File
}>()

const emits = defineEmits<{
  save: (file: Blob) => void
}>()

const { t } = useI18n()

const imgRef = templateRef<HTMLImageElement>('imgRef')
const cropper = shallowRef<Cropper | undefined>(undefined)
const state = shallowRef<'init' | 'idle' | 'cropping' | 'error'>('init')
const isLoading = computed(() => state.value === 'cropping')

const src = computedAsync<string>(async () => {
  return props.file
    ? await readImageFile(props.file)
    : ''
})

const aspectRatio = 1

function onImageLoad() {
  nextTick(() => {
    cropper.value = new Cropper(imgRef.value!, {
      aspectRatio,
    })

    state.value = 'idle'
  })
}

function save() {
  if (!cropper.value) {
    Message.error('cropper not ready')
    return
  }

  state.value = 'cropping'

  cropper.value?.getCroppedCanvas({
    maxWidth: 320,
    maxHeight: 320
  }).toBlob(async (blob) => {
    if (!blob) {
      Message.error('no data')
      return
    }

    imageCompression(blob as File, {
      maxSizeMB: 1,
      maxWidthOrHeight: 320,
      useWebWorker: true,
      initialQuality: 0.6,
    })
      .then((compressedFile) => {
        state.value = 'idle'
        console.log('compressedFile',compressedFile.size)
        emits('save', compressedFile)
      })
      .catch((error) => {
        state.value = 'error'
        console.error(error)

        Message.error(error)
      })
  })
}
</script>

<template>
  <div relative h800px w-full>
    <img ref="imgRef" :src="src" block h-full w-full object-contain @load="onImageLoad">
    <ToolbarRoot
      class="shadow-blackA7 absolute bottom-4 position-x-center max-w-[610px] w-fit flex rounded-md p-[10px] shadow-[0_2px_10px] !min-w-max bg-base"
      aria-label="Formatting options"
    >
      <ToolbarLink
        class="my-auto ml-0.5 h-[25px] inline-flex flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded bg-transparent px-[5px] text-[13px] leading-none outline-none focus:relative first:ml-0 hover:cursor-pointer bg-base data-[state=on]:bg-green5 hover:bg-green3 hover:bg-transparent data-[state=on]:text-primary !font-normal focus:shadow-[0_0_0_2px] focus:shadow-primary"
        target="_blank" style="margin-right: 10"
      >
        <!-- @vue-expect-error type error -->
        {{ file?.name || '' }}
      </ToolbarLink>
      <ToolbarSeparator class="mx-[10px] w-[1px] bg-gray dark:bg-black/50" />

      <ToolbarButton style="margin-left: auto">
        <a-button type="primary" rounded :loading="isLoading" @click="() => save()">
          {{ t('button.save') }}
        </a-button>
      </ToolbarButton>
    </ToolbarRoot>
  </div>
</template>

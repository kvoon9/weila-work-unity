<script setup lang="ts">
import imageCompression from 'browser-image-compression'
import Cropper from 'cropperjs'
import Spinner from './Spinner.vue'
import { useToast } from './ui/toast/use-toast'

const props = defineProps<{
  file: Blob | File
}>()

const emits = defineEmits<{
  save: (file: Blob | File) => void
}>()

const imgRef = templateRef<HTMLImageElement>('imgRef')
const cropper = ref<Cropper | undefined>(undefined)
const state = ref<'init' | 'idle' | 'cropping' | 'error'>('init')
const isCropping = computed(() => state.value === 'cropping')

const src = computedAsync<string>(async () => {
  return props.file
    ? await readImageFile(props.file)
    : ''
})

const aspectRatio = 1

$inspect(cropper)

function onImageLoad() {
  nextTick(() => {
    cropper.value = new Cropper(imgRef.value!, {
      aspectRatio,
    })

    state.value = 'idle'
  })
}

function save() {
  const { toast } = useToast()

  if (!cropper.value) {
    toast({ title: 'Oops...请稍后再试' })
    return
  }

  state.value = 'cropping'

  cropper.value?.getCroppedCanvas().toBlob(async (blob) => {
    if (!blob) {
      toast({ title: '无数据' })
      return
    }

    imageCompression(blob as File, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
      initialQuality: 0.6,
    })
      .then((compressedFile) => {
        state.value = 'idle'
        emits('save', compressedFile)
      })
      .catch((error) => {
        state.value = 'error'
        console.error(error)

        toast({ description: error })
      })
  })
}
</script>

<template>
  <div class="relative bg-slate-300 rounded-sm">
    <img ref="imgRef" :src="src" class="block h-full w-full object-contain" @load="onImageLoad">
    <ToolbarRoot
      class="bg-white shadow-blackA7 absolute bottom-4 position-x-center max-w-[610px] w-fit flex rounded-md p-[10px] shadow-[0_2px_10px] !min-w-max bg-base"
      aria-label="Formatting options"
    >
      <ToolbarLink
        class="my-auto ml-0.5 h-[25px] inline-flex flex-shrink-0 flex-grow-0 basis-auto items-center justify-center rounded bg-transparent px-[5px] text-[13px] leading-none outline-none focus:relative first:ml-0 hover:cursor-pointer bg-base data-[state=on]:bg-green5 hover:bg-green3 hover:bg-transparent data-[state=on]:text-primary !font-normal focus:shadow-[0_0_0_2px] focus:shadow-primary"
        target="_blank" style="margin-right: 10"
      >
        <!-- @vue-expect-error type error -->
        {{ file?.name || '' }}
      </ToolbarLink>
      <div class="m-x-[10px] w-[1px] bg-gray" />

      <ToolbarButton style="margin-left: auto">
        <Button @click="() => save()">
          <span v-if="!isCropping">
            保存
          </span>
          <Spinner v-else />
        </Button>
      </ToolbarButton>
    </ToolbarRoot>
  </div>
</template>

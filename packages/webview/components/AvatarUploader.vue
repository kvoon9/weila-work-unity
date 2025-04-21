<script setup lang="ts">
import { UseImage } from '@vueuse/components'
import axios from 'axios'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/plugins/api'
import { et } from '~/shared/states'

const src = defineModel<string>('src', { required: false })

const isSupported = shallowRef(true)
const { files, open, onChange } = useFileDialog({
  accept: 'image/*',
})

const file = computed(() => files.value?.[0])

const isCropperModalVisible = shallowRef(false)
const compressedFile = shallowRef<Blob | null>(null)

onChange(() => {
  isCropperModalVisible.value = true
})

function onSave(file: File) {
  isCropperModalVisible.value = false

  compressedFile.value = file
  src.value = URL.createObjectURL(file)
}

function upload() {
  if (!compressedFile.value)
    return

  const formData = new FormData()
  formData.append('file', compressedFile.value)

  const { access_token, app_id, app_sign } = useAuthStore()

  return axios.post(
    `${
      import.meta.dev
        ? '/proxy'
        : 'https://demo.weila.hk/v1'
    }${weilaApiUrl('/corp/web/avatar-upload')}?access-token=${access_token}&app_id=${app_id}&sign=${app_sign}&et=${String(et.value)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
    .then(({ data: _data }) => {
      const { data, errcode, errmsg } = _data
      if (data?.url) {
        src.value = data.url
        return data.url
      }
      else {
        throw new Error(`${errcode} ${errmsg}`)
      }
    })
    .catch((error: any) => {
      console.error('error', error)

      const { toast } = useToast()

      toast({ title: '头像上传失败', description: (error as Error)?.message || String(error) })
    })
}

defineExpose({
  upload,
})
</script>

<template>
  <div
    v-if="isSupported" class="cursor-pointer"
  >
    <UseImage
      v-if="src" :src="src" alt="avatar" class="mb-2 h-20 w-20 rounded object-cover" @click="() => open() "
    >
      <template #loading>
        <span class="flex items-center justify-center rounded bg-secondary size-20 p-4">
          <LucideLoaderCircle />
        </span>
      </template>
      <template #error>
        <span class="flex items-center justify-center rounded bg-secondary size-20 p-4">
          <LucideImageOff />
        </span>
      </template>
    </UseImage>
    <span
      v-else class="flex items-center justify-center rounded bg-secondary size-20 p-4" @click="() => {
        open()
      }"
    >
      <LucidePlus />
    </span>
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
            <TheCropper class="max-h-96" :file @save="onSave" />
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
  <div
    v-else disabled class="p-4 border cursor-pointer flex flex-col items-center space-y-2 text-gray-500 w-fit rounded-md"
  >
    <LucideAlertCircle class="text-rose-600" />
    <p>无法获取相册</p>
  </div>
</template>

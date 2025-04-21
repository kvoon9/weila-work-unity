<script setup lang="ts">
import type { FieldProps } from './ui/auto-form/interface'
import { UseImage } from '@vueuse/components'
import axios from 'axios'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/plugins/api'
import { et } from '~/shared/states'
import TheCropper from './TheCropper.vue'
import { AutoFormLabel } from './ui/auto-form'
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from './ui/form'
import { useToast } from './ui/toast/use-toast'

defineProps<FieldProps>()

const emits = defineEmits(['done'])

const isCropperModalVisible = shallowRef(false)
const compressedFile = shallowRef<Blob | null>(null)

const isSupported = shallowRef(true)
const { files, open } = useFileDialog({
  accept: 'image/*',
})

const file = computed(() => files.value?.[0])

// const { file, open, isSupported } = useFileSystemAccess({
//   types: [
//     {
//       description: 'Images',
//       accept: {
//         'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp', '.bmp', '.tiff', '.svg'],
//       },
//     },
//   ],
// })

// NOTE: set field value (src)
const setValue: any = shallowRef(() => void 0)

watch(file, (value) => {
  if (value)
    isCropperModalVisible.value = true
})

function onSave(file: File) {
  isCropperModalVisible.value = false

  compressedFile.value = file
  setValue.value(URL.createObjectURL(file))
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
        setValue.value(data.url)
        emits('done', data.url)
        return data.url
      }
      else {
        throw new Error(`${errcode} ${errmsg}`)
      }
    })
    .catch((error) => {
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
  <FormField v-slot="{ value: src, setValue: _setValue }" :name="fieldName">
    <FormItem v-bind="$attrs">
      <AutoFormLabel v-if="!config?.hideLabel">
        {{ config?.label }}
      </AutoFormLabel>
      <FormControl>
        <div
          v-if="isSupported" class="cursor-pointer"
        >
          <UseImage
            v-if="src" :src="src" alt="avatar" class="mb-2 h-20 w-20 rounded object-cover" @click="() => {
              setValue = _setValue;
              open();
            }"
          >
            <template #loading>
              <span class="flex items-center justify-center rounded bg-gray-50 size-20 p-4">
                <LucideLoaderCircle />
              </span>
            </template>
            <template #error>
              <span class="flex items-center justify-center rounded bg-gray-50 size-20 p-4">
                <LucideImageOff />
              </span>
            </template>
          </UseImage>
          <span
            v-else class="flex items-center justify-center rounded bg-gray-50 size-20 p-4" @click="() => {
              setValue = _setValue;
              open();
            }"
          >
            <LucidePlus />
          </span>
        </div>
        <div
          v-else disabled class="p-4 border cursor-pointer flex flex-col items-center space-y-2 text-gray-500 w-fit rounded-md"
        >
          <LucideAlertCircle class="text-rose-600" />
          <p>无法获取相册</p>
        </div>
      </FormControl>
      <FormDescription v-if="config?.description">
        {{ config.description }}
      </FormDescription>
      <FormMessage />
    </FormItem>

    <Teleport to="body">
      <Dialog v-model:open="isCropperModalVisible">
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>裁剪图片</DialogTitle>
            <DialogDescription>
              裁剪图片尺寸
            </DialogDescription>
          </DialogHeader>
          <!-- @vue-expect-error type -->
          <TheCropper class="max-h-96" :file @save="onSave" />
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </Teleport>
  </FormField>
</template>

import type { UseMutationOptions } from '@tanstack/vue-query'
import type { Reactive } from 'vue'
import { toArray } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { ref as deepRef } from 'vue'

export type UploadFileWarpper = Reactive<{
  id: string
  url: string | undefined
  dataUrl: string
  state: 'pending' | 'success' | 'error'
  error?: string
  raw?: File
}>

export function toFileWrapper(url: string) {
  return <UploadFileWarpper>{
    id: url,
    url,
    state: 'success',
    dataUrl: url,
  }
}

export function useUploadFile(options?: Omit<UseMutationOptions, 'mutationFn'>) {
  const filelist = deepRef<UploadFileWarpper[]>([])

  const hasPending = computed(() => filelist.value.some(f => f.state === 'pending'))
  const pendingFilelist = computed(() => filelist.value.filter(f => f.state === 'pending'))
  const validFilelist = computed(() => filelist.value.filter(f => f.state === 'success'))

  return {
    filelist,
    pendingFilelist,
    validFilelist,
    hasPending,
    ...useMutation({
      mutationFn: async (file: File | File[]) => {
        const files = toArray(file)

        const urls: string[] = []

        for (const f of files) {
          const wrapper: UploadFileWarpper = reactive({
            id: f.name,
            url: undefined,
            state: 'pending',
            dataUrl: URL.createObjectURL(f),
            raw: f,
          })
          filelist.value.push(wrapper)

          const formData = new FormData()
          formData.append('file', f)

          try {
            const url = await weilaAxiosInstanceV2.post<string>(
              'common/upload-file',
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              },
            )

            wrapper.url = url
            wrapper.state = 'success'
          }
          catch (error) {
            wrapper.state = 'error'
            wrapper.error = error as string

            throw new Error('文件上传失败')
          }
        }

        return urls
      },
      ...options,
    }),
  }
}

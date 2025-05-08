import type { UseMutationOptions } from '@tanstack/vue-query'
import type { $Fetch } from 'ofetch'
import type { Reactive } from 'vue'
import type { WeilaRequestInstance } from '../types'
import { toArray } from '@antfu/utils'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, ref as deepRef, reactive } from 'vue'

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

export function useUploadFile(request: WeilaRequestInstance, options?: Omit<UseMutationOptions, 'mutationFn'>) {
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
            const { data } = await request.post<{ url: string }>(
              'common/upload-file',
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              },
            )

            wrapper.url = data?.url || ''
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

/**
 * @description 应用下载链接类型
 *
 * corp-demo 企业测试版
 * corp-normal 企业正式版
 * weila-demo 微喇个人版测试版
 * weila-normal 微喇个人正式版
 */
export enum AppDownloadLinkType {
  CorpDemo = 'corp-demo',
  CorpNormal = 'corp-normal',
  WeilaDemo = 'weila-demo',
  WeilaNormal = 'weila-normal',
}

export interface AppDownloadLinkPayload {
  type: AppDownloadLinkType
}

export interface AppDownloadLinkModel {
  url: string
  avatar: string
}

export function useAppDownloadLink(api: $Fetch, body: Reactive<AppDownloadLinkPayload>) {
  return useQuery({
    queryKey: ['app-download-link', body],
    queryFn: () => api<AppDownloadLinkModel>('web/app-download', { body }),
  })
}

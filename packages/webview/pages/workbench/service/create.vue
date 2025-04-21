<script setup lang="ts">
import type { FileUploader } from '#components'
import type { RegeoV2 } from '~/shared/types'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref as deepRef, shallowRef } from 'vue'

import * as z from 'zod'

definePageMeta({
  layout: 'back',
})

appHead.value = '创建服务号'

const router = useRouter()
const { $v2 } = useNuxtApp()
const avatarRef = templateRef<any>('avatarRef')

const createServiceSchema = z.object({
  name: z.string().max(50, '名称最长50个字符'),
  phone: z.string().length(11, '手机号必须为11位'),
  avatar: z.string().default('').optional(),
  intro: z.string().max(200, '简介最长200个字符').default('').optional(),
  album: z.array(z.string()).default([
    'http://download.weila.hk/tmp/2025-03-28/1743147275_8551e1fd.png',
  ]).optional(),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(createServiceSchema),
})

const [name, nameAttrs] = defineField('name')
const [avatar, avatarAttrs] = defineField('avatar')
const [intro, introAttrs] = defineField('intro')
const [phone, phoneAttrs] = defineField('phone')
const [album] = defineField('album')
const regeo = deepRef<(RegeoV2 & {
  lat: number
  lon: number
}) | null>(null)
const albumRef = templateRef<Pick<InstanceType<typeof FileUploader>, 'filelist'>>('albumRef')

const { mutate: createService, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof createServiceSchema>) => {
    // 上传头像
    const { upload } = avatarRef.value
    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    // 构建请求体
    const body = {
      business: {
        type: 0,
        merchant: {
          type: 256,
          name: values.name,
          avatar: avatar || 'http://weilaavatar.oss-cn-shenzhen.aliyuncs.com/default/user.png',
          intro: values.intro || '',
          phone: values.phone || '',
          album: albumRef.value.filelist.map(f => f.url),
          ...(regeo.value || {}),
        },
      },
    }

    return await $v2('corp/busi/create-business', {
      body,
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '创建服务号成功' })
    router.back()
  },
  onError(error) {
    const { toast } = useToast()
    toast({
      title: '创建失败',
      description: String(error),
    })
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    createService(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '创建失败',
      description: String(errmsg),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

const openAddrPicker = shallowRef(false)
</script>

<template>
  <div p8>
    <form flex flex-col space-y-2 @submit.prevent="onSubmit">
      <label label for="name">名称</label>
      <input v-bind="nameAttrs" v-model="name" input type="text" name="name">
      <span text-red>{{ errors.name }}</span>

      <label label for="phone">手机号</label>
      <input v-bind="phoneAttrs" v-model="phone" input type="text" name="phone">
      <span text-red>{{ errors.phone }}</span>

      <label label for="avatar">头像</label>
      <AvatarUploader ref="avatarRef" v-bind="avatarAttrs" v-model:src="avatar" />
      <span text-red>{{ errors.avatar }}</span>

      <label label for="intro">简介 ({{ intro?.length || 0 }}/200)</label>
      <textarea v-bind="introAttrs" v-model="intro" input h-fit resize-none rows="3" name="intro" />
      <span text-red>{{ errors.intro }}</span>

      <label label for="album">业务展示</label>
      <FileUploader ref="albumRef" @update:files="(files) => album = files" />
      <span text-red>{{ errors.album }}</span>

      <label label for="address">地址</label>
      <div relative h-fit>
        <textarea disabled :value="regeo ? `${regeo.province}${regeo.city}${regeo.district}${regeo.Address}` : ''" w-full relative rows="3" type="text" bg-none name="address" />

        <DialogRoot v-model:open="openAddrPicker">
          <DialogTrigger as-child>
            <div absolute right-2 bottom-4 btn="primary sm" flex items-center space-x-2 rounded-md w-fit>
              <Icon name="ph:map-pin" />
              <span break-keep>位置选择</span>
            </div>
          </DialogTrigger>
          <DialogPortal to="body">
            <DialogOverlay fixed inset-0 z-130 backdrop-blur-90 />
            <DialogContent fixed position-center w90vw h90vh z131>
              <DialogTitle text-lg font-semibold>
                位置选择
              </DialogTitle>
              <DialogDescription color-secondary>
                请选择一个位置
              </DialogDescription>
              <DialogClose class="absolute top-2 right-2">
                <Icon name="ph:x-bold" />
              </DialogClose>
              <MapPicker
                border="3 ~"
                rounded-xl of-hidden h80vh @update:value="(data) => {
                  regeo = data
                  openAddrPicker = false
                }"
              />
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
      </div>

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        创建
      </button>
    </form>
  </div>
</template>

<style scoped>
input,
select,
textarea {
  --at-apply: p2 rounded bg-secondary;
}
</style>

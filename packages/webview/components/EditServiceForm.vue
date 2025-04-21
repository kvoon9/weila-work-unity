<script setup lang="ts">
import type { FileUploader } from '#components'
import type { RegeoV2 } from '~/shared/types'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref as deepRef, shallowRef } from 'vue'
import * as z from 'zod'

const props = defineProps<{
  ssid: number
}>()

const router = useRouter()

const avatarRef = templateRef<any>('avatarRef')

// 获取当前业务信息
const { data, isLoading: isLoadingBusiness, refetch } = useMyBusiness()
const { mutateAsync } = useMutateBusiness()

// try { await refetch() }
// catch {}

// 创建表单验证 Schema
const editServiceSchema = z.object({
  name: z.string().max(50, '名称最长50个字符'),
  phone: z.string().length(11, '手机号必须为11位'),
  avatar: z.string().default('').optional(),
  intro: z.string().max(200, '简介最长200个字符').default('').optional(),
  album: z.array(z.string()).default([]).optional(),
})

// 地理位置信息
const regeo = deepRef<(RegeoV2 & {
  lat: number
  lon: number
}) | null>(null)

// 创建表单
const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(editServiceSchema),
  initialValues: {
    name: data.value?.merchant.name,
    phone: data.value?.merchant.phone,
    avatar: data.value?.merchant.avatar,
    intro: data.value?.merchant.intro,
    album: data.value?.merchant.album,
  },
})

// 定义表单字段
const [name, nameAttrs] = defineField('name')
const [avatar, avatarAttrs] = defineField('avatar')
const [intro, introAttrs] = defineField('intro')
const [phone, phoneAttrs] = defineField('phone')
const [album] = defineField('album')
const isUploadingAlbum = shallowRef(false)

$inspect(album)

// 相册引用
const albumRef = templateRef<Pick<InstanceType<typeof FileUploader>, 'filelist'>>('albumRef')

watchImmediate(data, (value) => {
  if (value) {
    regeo.value = {
      lat: value.merchant.lat,
      lon: value.merchant.lon,
      province: '',
      city: '',
      district: '',
      Address: value.merchant.address || '',
      adcode: value.merchant.adcode,
      citycode: value.merchant.citycode || '',
      township: value.merchant.township || '',
    }
  }
})

// 提交修改服务号信息
const { mutateAsync: updateService, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof editServiceSchema>) => {
    if (!data.value)
      return

    // 上传头像
    const { upload } = avatarRef.value
    const avatarUrl = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    // 构建请求体
    const params = {
      business: {
        id: props.ssid,
        merchant: {
          type: data.value.merchant.type,
          name: values.name,
          avatar: avatarUrl || 'http://weilaavatar.oss-cn-shenzhen.aliyuncs.com/default/user.png',
          intro: values.intro || '',
          phone: values.phone || '',
          album: albumRef.value.filelist.map(f => f.url).filter(Boolean) as string[],
          lat: regeo.value?.lat || 0,
          lon: regeo.value?.lon || 0,
          citycode: regeo.value?.citycode || '',
          adcode: regeo.value?.adcode || '',
          township: regeo.value?.township || '',
          address: regeo.value?.Address || '',
        },
      },
    }

    // 调用修改接口
    return mutateAsync(params)
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '修改服务号成功' })
    router.back()
    nextTick(refetch)
  },
  onError(error) {
    const { toast } = useToast()
    toast({
      title: '修改失败',
      description: String(error),
    })
  },
})

// 表单提交处理
const onSubmit = handleSubmit(async (values) => {
  try {
    if (isUploadingAlbum.value) {
      const { toast } = useToast()
      toast({
        title: '业务图片上传中',
        description: '请稍后再试',
      })
      return
    }

    await updateService(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '修改失败',
      description: String(errmsg),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

// 地址选择器状态
const openAddrPicker = shallowRef(false)
</script>

<template>
  <div p8>
    <div v-if="isLoadingBusiness" flex justify-center items-center h-60vh>
      <Loading />
    </div>
    <form v-else flex flex-col space-y-2 @submit.prevent="onSubmit">
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
      <FileUploader ref="albumRef" v-model:is-uploading="isUploadingAlbum" :initial-files="data?.merchant.album" @update:files="(files) => album = files" />
      <span text-red>{{ errors.album }}</span>

      <label label for="address">地址</label>
      <div relative h-fit>
        <textarea
          :value="regeo ? `${regeo.Address}` : ''"
          w-full
          relative rows="3" type="text" bg-none name="address" @input="(e) => {
            // @ts-expect-error type error
            regeo.Address = e.target.value
          }"
        />

        <DialogRoot v-model:open="openAddrPicker">
          <DialogTrigger as-child>
            <div absolute right-2 bottom-4 btn="primary sm" flex items-center space-x-2 rounded-md w-fit>
              <Icon name="ph:map-pin" />
              <span break-keep>位置选择</span>
            </div>
          </DialogTrigger>
          <DialogPortal to="body">
            <DialogOverlay fixed inset-0 z130 backdrop-blur-90 />
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
                rounded-xl of-hidden h80vh
                :options="{
                  center: regeo ? [
                    regeo.lon,
                    regeo.lat,
                  ] : undefined,
                }"
                @update:value="(data) => {
                  regeo = data
                  openAddrPicker = false
                }"
              />
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
      </div>

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        保存修改
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

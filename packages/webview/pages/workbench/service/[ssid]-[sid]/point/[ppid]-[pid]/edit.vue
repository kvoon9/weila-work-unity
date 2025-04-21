<script setup lang="ts">
import type { FileUploader } from '#components'
import type { RegeoV2 } from '~/shared/types'
import { objectKeys } from '@antfu/utils'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref as deepRef, shallowRef } from 'vue'

definePageMeta({
  layout: 'back',
})

appHead.value = '编辑服务点'

// 获取路由参数

const ppid = useRouteParams<number>('ppid', 0, { transform: Number })

const sid = useRouteParams<number>('sid', 0, { transform: Number })

const router = useRouter()
const avatarRef = templateRef<any>('avatarRef')

const pointListPayload = reactive({ sid: sid.value })
const { data: pointListData, isLoading, refetch: refetchPointList } = useBusinessPointList(pointListPayload)

const currentPoint = pointListData.value?.points.find(point => point.id === ppid.value)

const { mutateAsync: deletePointMutation, isPending: isDeleting } = delBusinessPoint()

const regeo = deepRef<(RegeoV2 & {
  lat: number
  lon: number
}) | null>(null)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(changeBusinessPointSchema),
  initialValues: {
    id: currentPoint?.id || ppid.value,
    name: currentPoint?.name || '',
    phone: currentPoint?.phone || '',
    avatar: currentPoint?.avatar || '',
    intro: currentPoint?.intro || '',
    album: currentPoint?.album || [],
    address: regeo.value
      ? regeo.value.Address
      : currentPoint?.address,
    lat: currentPoint?.lat || 0,
    lon: currentPoint?.lon || 0,
    adcode: currentPoint?.adcode || '',
  },
})

// 定义表单字段
defineField('id')

const [name, nameAttrs] = defineField('name')
const [avatar, avatarAttrs] = defineField('avatar')
const [intro, introAttrs] = defineField('intro')
const [phone, phoneAttrs] = defineField('phone')
const [album] = defineField('album')
const isUploadingAlbum = shallowRef(false)

const [lat] = defineField('lat')
const [lon] = defineField('lon')
const [adcode] = defineField('adcode')
const [addr] = defineField('address')
watch(regeo, (value) => {
  if (value) {
    lat.value = value.lat
    lon.value = value.lon
    adcode.value = value.adcode
    addr.value = value.Address
  }
})

const albumRef = templateRef<Pick<InstanceType<typeof FileUploader>, 'filelist'>>('albumRef')

$inspect(album)

const { mutateAsync: changePoint, isPending } = changeBusinessPoint()

const onSubmit = handleSubmit((values) => {
  if (isUploadingAlbum.value) {
    const { toast } = useToast()
    toast({
      title: '业务图片上传中',
      description: '请稍后再试',
    })
    return
  }

  changePoint(values, {
    onSuccess() {
      const { toast } = useToast()
      toast({ title: '修改服务点成功' })
      router.back()
      refetchPointList()
    },
  })
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

const openAddrPicker = shallowRef(false)

const isDeleteModalVisible = shallowRef(false)
function handleDeletePoint() {
  if (!ppid.value)
    return

  deletePointMutation(
    { pid: ppid.value },
    {
      onSuccess() {
        const { toast } = useToast()
        toast({ title: '删除服务点成功' })
        isDeleteModalVisible.value = false
        router.go(-2)
        refetchPointList()
      },
    },
  )
}

function onInputAddr(e: any) {
  addr.value = e.target.value
}
</script>

<template>
  <div p8>
    <div v-if="isLoading" flex justify-center items-center h-60vh>
      <Loading />
    </div>
    <div v-else-if="!currentPoint" flex flex-col items-center justify-center h-60vh>
      <p text-lg>
        服务点不存在
      </p>
    </div>
    <form v-else flex flex-col space-y-2 @submit="onSubmit">
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
      <FileUploader ref="albumRef" v-model:is-uploading="isUploadingAlbum" :initial-files="currentPoint?.album" @update:files="(files) => album = files" />
      <span text-red>{{ errors.album }}</span>

      <label label for="address">地址</label>
      <div relative h-fit>
        <textarea
          :value="addr"
          w-full
          relative rows="3" type="text" bg-none name="address"
          @input="onInputAddr"
        />

        <DialogRoot v-model:open="openAddrPicker">
          <DialogTrigger as-child>
            <div absolute right-2 bottom-4 btn="primary sm" flex items-center space-x-2 rounded-md w-fit>
              <Icon name="ph:map-pin" />
              <span break-keep>位置选择</span>
            </div>
          </DialogTrigger>
          <DialogPortal to="body">
            <DialogOverlay fixed z-101 inset-0 backdrop-blur-90 />
            <DialogContent fixed position-center w90vw h90vh z-102>
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
                :options="{
                  center: currentPoint ? [currentPoint.lon, currentPoint.lat] : undefined,
                  zoom: 15,
                  radius: 300,
                }"
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
        保存修改
      </button>

      <NuxtLink btn="~ secondary" to="./staff">
        客服列表
      </NuxtLink>

      <DialogRoot v-model:open="isDeleteModalVisible">
        <DialogTrigger>
          <button type="button" btn-ghost text-red w-full>
            删除
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] border focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              删除服务点
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              您确定要删除该服务点吗？此操作无法撤销。
            </DialogDescription>
            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-is-loading="isDeleting" btn bg-red-400 text-white @click="handleDeletePoint">
                确认
              </button>
            </div>
            <DialogClose
              class="text-grass11 hover:bg-green4 focus:shadow-green7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
              <Icon name="lucide:x" />
            </DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
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

<script setup lang="ts">
import type { MemberChangeModel, MemberChangePayload, MemberDeleteModel } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { shallowRef } from 'vue'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'
import { boolNumSchema, trackOptions } from '~/shared/const'

definePageMeta({
  layout: 'back',
})

appHead.value = '编辑设备'

const router = useRouter()
const device_id = useRouteParams('id', '0', { transform: Number })

const device = useDevice(device_id)

const { org_num } = useCorp()
const { $v1 } = useNuxtApp()

const editSchema = z.object({
  name: z.string().max(20),
  job_num: z.string().max(20).optional(),
  dept_id: z.number().optional(),
  // phone: z.string().optional(),
  tts: boolNumSchema.optional(),
  loc_share: boolNumSchema.optional(),
  track: z.number().optional(),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(editSchema),
  initialValues: {
    name: device?.value?.name || '',
    job_num: device?.value?.job_num || '',
    dept_id: device?.value?.dept_id || 0,
    // phone: device?.value?.phone || '',
    tts: device?.value?.tts as 0 | 1 | undefined || 0,
    loc_share: device?.value?.loc_share as 0 | 1 | undefined || 0,
    track: device?.value?.track as 0 | 1 | undefined || 0,
  },
})

const [name, nameAttrs] = defineField('name')
const [job_num, job_numAttrs] = defineField('job_num')
const [dept_id, dept_idAttrs] = defineField('dept_id')
// const [phone, phoneAttrs] = defineField('phone')
const [_tts, _ttsAttrs] = defineField('tts')
const [loc_share, loc_shareAttrs] = defineField('loc_share')
const [track, trackAttrs] = defineField('track')

const { data: depts } = useDeptList()

const { mutate: edit, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof editSchema>) => {
    const body: Partial<MemberChangePayload> = {
      ...values,
      org_num: org_num.value!,
      member_id: device_id.value,
    }

    return $v1<MemberChangeModel>(weilaApiUrl('/corp/web/member-change'), {
      body,
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '编辑成功' })
    router.back()
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    edit(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '编辑失败',
      description: String(errmsg),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())

const isDeleteModalVisible = shallowRef(false)
const { mutate: deleteDevice, isPending: isDeleting } = useMutation({
  mutationFn: (device_id: number) =>
    $v1<MemberDeleteModel>(
      weilaApiUrl('/corp/web/member-delete'),
      {
        body: {
          org_num: org_num.value,
          device_id,
        },
      },
    ),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '删除成功' })
    isDeleteModalVisible.value = false
    router.back()
  },
})
</script>

<template>
  <div p8>
    <form flex flex-col space-y-2 @submit.prevent="onSubmit">
      <label label for="name">名称</label>
      <input v-bind="nameAttrs" v-model="name" input type="text" name="name">
      <span text-red>{{ errors.name }}</span>

      <label label for="job_num">工号</label>
      <input v-bind="job_numAttrs" v-model="job_num" input type="text" name="job_num">
      <span text-red>{{ errors.job_num }}</span>

      <label label for="dept_id">部门</label>
      <select v-bind="dept_idAttrs" v-model="dept_id" select name="dept_id">
        <option v-for="dept in depts" :key="dept.id" :value="dept.id">
          {{ dept.name }}
        </option>
      </select>
      <span text-red>{{ errors.dept_id }}</span>

      <!-- <label label for="phone">手机号</label>
      <input v-bind="phoneAttrs" v-model="phone" input type="text" name="phone">
      <span text-red>{{ errors.phone }}</span> -->

      <label label for="track">轨迹上报频率</label>
      <select v-bind="trackAttrs" v-model="track" select name="track">
        <option v-for="option in trackOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span text-red>{{ errors.track }}</span>

      <!-- <FormItemCheckBox v-model:model-value="tts" label="TTS" name="tts" :attrs="ttsAttrs" /> -->

      <FormItemCheckBox v-model:model-value="loc_share" label="位置共享" name="loc_share" :attrs="loc_shareAttrs" />

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        保存
      </button>

      <DialogRoot v-model:open="isDeleteModalVisible">
        <DialogTrigger>
          <button type="button" btn-ghost text-red w-full>
            删除
          </button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay class="backdrop-blur bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
          <DialogContent
            class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] border  focus:outline-none z-[100]"
          >
            <DialogTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              删除设备
            </DialogTitle>
            <DialogDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              您确定要删除该设备吗？
            </DialogDescription>
            <div flex justify-end space-x-2 mt-4>
              <DialogClose btn btn-secondary>
                取消
              </DialogClose>
              <button v-is-loading="isDeleting" btn bg-red-400 text-white @click="() => deleteDevice(device_id)">
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
select {
  --at-apply: p2 rounded bg-secondary;
}
</style>

<script setup lang="ts">
import type { MemberCreateModel, MemberCreatePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import * as z from 'zod'
import AutoFormFieldDepts from '~/components/AutoFormFieldDepts.vue'
import AutoFormFieldSex from '~/components/AutoFormFieldSex.vue'
import AutoFormFieldTrack from '~/components/AutoFormFieldTrack.vue'
import AutoFormFieldWeilaSwitch from '~/components/AutoFormFieldWeilaSwitch.vue'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'
import { boolNumSchema } from '~/shared/const'

const emits = defineEmits(['done'])

const { org_num } = useCorp()

const { $v1 } = useNuxtApp()
const open = ref(false)

const avatarRef = templateRef<any>('avatarRef')
const addDeviceSchema = computed(() =>
  z.object({
    verify_code: z.string().max(20),
    name: z.string().max(20),
    job_num: z.string().max(20).optional(),
    dept_id: z.number().default(0),
    sex: boolNumSchema.optional(),
    avatar: z.string().optional(),
    phone: z.string().length(11).optional(),
    tts: boolNumSchema.default(0),
    loc_share: boolNumSchema.default(0),
    track: z.number().default(0),
  }),
)

const { mutate: onSubmit, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof addDeviceSchema.value>) => {
    const body: Partial<MemberCreatePayload> = {
      ...values,
      org_num: Number(org_num.value),

      // FIXME: default in schema is not work
      job_num: values.job_num || '',
      dept_id: values.dept_id || 0,
      sex: values.sex || 0,
      tts: values.tts || 0,
      loc_share: values.loc_share || 0,
      avatar: values.avatar || '',
      phone: values.phone || '',
    }

    return await $v1<MemberCreateModel>(weilaApiUrl('/corp/web/member-add-device'), {
      body,
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '创建成员成功' })
    open.value = false
    emits('done')
    useAllMember().refetch()
    useDepts().refetch()
  },
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger>
      <Button size="sm">
        <LucideBot />
        添加设备
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-[100vh] overflow-y-scroll pt-0">
      <DialogHeader class="sticky top-0 bg-white pt-4">
        <DialogTitle>添加设备</DialogTitle>
        <DialogDescription>
          使用设备验证码添加设备
        </DialogDescription>
      </DialogHeader>
      <div class="max-md:max-h-[30vh]">
        <AutoForm
          class="space-y-2 px-4"
          :schema="addDeviceSchema"
          :field-config="{
            verify_code: { label: '验证码' },
            name: { label: '名称' },
            dept_id: { label: '部门', component: AutoFormFieldDepts },
            job_num: { label: '工号' },
            phone: { label: '手机号' },
            sex: { label: '性别', component: AutoFormFieldSex },
            // avatar: { label: '头像' },
            tts: { label: 'TTS', component: AutoFormFieldWeilaSwitch },
            loc_share: { label: '位置共享', component: AutoFormFieldWeilaSwitch },
            track: { label: '轨迹上报频率', component: AutoFormFieldTrack },
          }"
          @submit="onSubmit"
        >
          <template #avatar="slotProps">
            <AutoFormField v-bind="slotProps" field-name="头像" class="w-full">
              <AutoFormFieldAvatar v-bind="slotProps" ref="avatarRef" />
            </AutoFormField>
          </template>

          <DialogFooter class="flex flex-row space-x-2 justify-end py-2">
            <Button v-is-loading="isPending" class="w-fit" type="submit">
              提交
            </Button>
            <DialogClose class="md:hidden" as-child>
              <Button variant="outline" class="w-fit">
                关闭
              </Button>
            </DialogClose>
          </DialogFooter>
        </AutoForm>
      </div>
    </DialogContent>
  </Dialog>
</template>

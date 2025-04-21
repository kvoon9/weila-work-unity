<script setup lang="ts">
import type { MemberChangeModel, MemberChangePayload, MemberGetallModel } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import AutoFormFieldDepts from '~/components/AutoFormFieldDepts.vue'
import AutoFormFieldSex from '~/components/AutoFormFieldSex.vue'
import AutoFormFieldTrack from '~/components/AutoFormFieldTrack.vue'
import AutoFormFieldWeilaSwitch from '~/components/AutoFormFieldWeilaSwitch.vue'
import { useToast } from '~/components/ui/toast'
import { weilaApiUrl } from '~/plugins/api'
import { boolNumSchema } from '~/shared/const'

const props = defineProps<{
  member: MemberGetallModel['data']['members'][number]
}>()

const emits = defineEmits(['done'])

const info = computed(() => `${props.member.name}(${props.member.user_num})`)

const { org_num } = useCorp()
const { $v1 } = useNuxtApp()

const open = defineModel('open', { default: false })

const editSchema = z.object({
  name: z.string().max(20),
  job_num: z.string().max(20).optional(),
  dept_id: z.number().default(0),
  sex: boolNumSchema.optional(),
  avatar: z.string().optional(),
  phone: z.string().length(11).optional(),
  tts: boolNumSchema.default(0),
  loc_share: boolNumSchema.default(0),
  track: z.number().default(0),
})
const avatarRef = templateRef<any>('avatarRef')

const editForm = useForm({
  validationSchema: toTypedSchema(editSchema),
})
watchEffect(() => {
  if (open.value) {
    editForm.setFieldValue('name', props.member.name)
    editForm.setFieldValue('job_num', props.member.job_num)
    editForm.setFieldValue('dept_id', props.member.dept_id)
    editForm.setFieldValue('sex', props.member.sex as 0 | 1)
    editForm.setFieldValue('avatar', props.member.avatar)
    if (props.member.phone)
      editForm.setFieldValue('phone', props.member.phone)
    editForm.setFieldValue('tts', props.member.tts as 0 | 1)
    editForm.setFieldValue('loc_share', props.member.loc_share as 0 | 1)
    editForm.setFieldValue('track', props.member.track)
  }
})

const { mutate: edit, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof editSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body: Partial<MemberChangePayload> = {
      ...values,
      avatar,
      org_num: org_num.value!,
      member_id: props.member.user_id,
    }

    return $v1<MemberChangeModel>(weilaApiUrl('/corp/web/member-change'), {
      body,
    })
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '编辑成功' })
    open.value = false
    emits('done')
    useAllMember().refetch()
  },
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child />
    <DialogContent class="max-h-[100vh] overflow-y-scroll pt-0">
      <DialogHeader class="sticky top-0 bg-white pt-4">
        <DialogTitle>编辑</DialogTitle>
        <DialogDescription>
          编辑设备: {{ info }}
        </DialogDescription>
      </DialogHeader>
      <div class="max-md:max-h-[30vh]">
        <AutoForm
          class="space-y-2 px-4"
          :form="editForm"
          :schema="editSchema"
          :field-config="{
            name: { label: '名称' },
            dept_id: { label: '部门', component: AutoFormFieldDepts },
            job_num: { label: '工号' },
            phone: { label: '手机号' },
            sex: { label: '性别', component: AutoFormFieldSex },
            // avatar: { label: '头像', component: AutoFormFieldAvatar },
            tts: { label: 'TTS', component: AutoFormFieldWeilaSwitch },
            loc_share: { label: '位置共享', component: AutoFormFieldWeilaSwitch },
            track: { label: '轨迹上报频率', component: AutoFormFieldTrack },
          }"
          @submit="edit"
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

<script setup lang="ts">
import type { MemberCreateModel, MemberCreatePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import md5 from 'md5'
import * as z from 'zod'
import AutoFormFieldAvatar from '~/components/AutoFormFieldAvatar.vue'
import AutoFormFieldDepts from '~/components/AutoFormFieldDepts.vue'
import AutoFormFieldSex from '~/components/AutoFormFieldSex.vue'
import AutoFormFieldWeilaSwitch from '~/components/AutoFormFieldWeilaSwitch.vue'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'
import { boolNumSchema } from '~/shared/const'

const emits = defineEmits(['done'])

const { org_num } = useCorp()

const avatarRef = templateRef<any>('avatarRef')

const { $v1 } = useNuxtApp()

const open = ref(false)

const createMemberSchema = computed(() =>
  z.object({
    name: z.string().max(20),
    password: z.string().nonempty().default('123456'),
    job_num: z.string().max(20).default('').optional(),
    dept_id: z.number().default(0),
    sex: boolNumSchema.default(0).optional(),
    avatar: z.string().default('').optional(),
    phone: z.string().length(11).optional(),
    tts: boolNumSchema.default(0),
    loc_share: boolNumSchema.default(0),
  }),
)

type CreateMemberSchema = z.infer<typeof createMemberSchema.value>

const { mutate: onSubmit, isPending } = useMutation({
  mutationFn: async (values: CreateMemberSchema) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body: Partial<MemberCreatePayload> = {
      ...values,
      org_num: Number(org_num.value),
      password: md5(values.password),

      // FIXME: default in schema is not work
      job_num: values.job_num || '',
      dept_id: values.dept_id || 0,
      sex: values.sex || 0,
      tts: values.tts || 0,
      loc_share: values.loc_share || 0,
      avatar,
      phone: values.phone || '',
    }

    return await $v1<MemberCreateModel>(weilaApiUrl('/corp/web/member-create'), {
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
        <LucidePlus />
        创建成员
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-[100vh] overflow-y-scroll pt-0">
      <DialogHeader class="sticky top-0 bg-white pt-4">
        <DialogTitle>创建成员</DialogTitle>
        <DialogDescription>
          填写成员信息以创建成员
        </DialogDescription>
      </DialogHeader>
      <div class="max-md:max-h-[30vh]">
        <AutoForm
          class="space-y-2 pb-4 px-4"
          :schema="createMemberSchema"
          :field-config="{
            name: { label: '名称' },
            dept_id: { label: '部门', component: AutoFormFieldDepts },
            job_num: { label: '工号' },
            phone: { label: '手机号' },
            password: { label: '密码', inputProps: { type: 'password' } },
            sex: { label: '性别', component: AutoFormFieldSex },
            // avatar: { label: '头像', component: AutoFormFieldAvatar },
            tts: { label: 'TTS', component: AutoFormFieldWeilaSwitch },
            loc_share: { label: '位置共享', component: AutoFormFieldWeilaSwitch },
          }"
          @submit="(values) => onSubmit(values)"
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

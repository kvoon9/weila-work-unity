<script setup lang="ts">
import type { MemberCreateModel, MemberCreatePayload } from '~/fixture/mock'
import { objectKeys } from '@antfu/utils'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import md5 from 'md5'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { weilaApiUrl } from '~/plugins/api'
import { boolNumSchema } from '~/shared/const'

definePageMeta({
  layout: 'back',
})

appHead.value = '创建成员'

const router = useRouter()
const { org_num } = useCorp()
const { data: depts } = useDeptList()
const { $v1 } = useNuxtApp()
const avatarRef = templateRef<any>('avatarRef')

const { refetch: refetchMemberList } = useMemberList()

const createMemberSchema = z.object({
  name: z.string().max(20),
  password: z.string().nonempty().default('123456'),
  job_num: z.string().max(20).default('').optional(),
  dept_id: z.number().default(0),
  sex: boolNumSchema.default(0).optional(),
  avatar: z.string().default('').optional(),
  phone: z.string().length(11).optional(),
  tts: boolNumSchema.default(0),
  loc_share: boolNumSchema.default(0),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(createMemberSchema),
})

const [name, nameAttrs] = defineField('name')
const [password, passwordAttrs] = defineField('password')
const [job_num, job_numAttrs] = defineField('job_num')
const [dept_id, dept_idAttrs] = defineField('dept_id')
const [sex, sexAttrs] = defineField('sex')
const [avatar, avatarAttrs] = defineField('avatar')
const [phone, phoneAttrs] = defineField('phone')
const [tts, ttsAttrs] = defineField('tts')
const [loc_share, loc_shareAttrs] = defineField('loc_share')

$inspect(avatar)
$inspect(tts)
$inspect(loc_share)

const { mutate: createMember, isPending } = useMutation({
  mutationFn: async (values: z.infer<typeof createMemberSchema>) => {
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
    router.back()
    refetchMemberList()
  },
})

const onSubmit = handleSubmit((values) => {
  try {
    createMember(values)
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '创建失败',
      description: String(errmsg),
    })
  }
}, ({ errors }) => document.querySelector(`label[for="${objectKeys(errors)[0]}"]`)?.scrollIntoView())
</script>

<template>
  <div p8>
    <h1 text-xl font-bold mb-4>
      创建成员
    </h1>
    <form flex flex-col space-y-2 @submit.prevent="onSubmit">
      <label label for="name">名称</label>
      <input v-bind="nameAttrs" v-model="name" input type="text" name="name">
      <span text-red>{{ errors.name }}</span>

      <label label for="avatar">头像</label>
      <AvatarUploader ref="avatarRef" v-bind="avatarAttrs" v-model:src="avatar" />
      <span text-red>{{ errors.avatar }}</span>

      <label label for="password">密码</label>
      <input v-bind="passwordAttrs" v-model="password" input type="text" name="password">
      <span text-red>{{ errors.password }}</span>

      <label label for="dept_id">部门</label>
      <select v-bind="dept_idAttrs" v-model="dept_id" select name="dept_id">
        <option v-for="dept in depts" :key="dept.id" :value="dept.id">
          {{ dept.name }}
        </option>
      </select>
      <span text-red>{{ errors.dept_id }}</span>

      <label label for="job_num">工号</label>
      <input v-bind="job_numAttrs" v-model="job_num" input type="text" name="job_num">
      <span text-red>{{ errors.job_num }}</span>

      <label label for="sex">性别</label>
      <select v-bind="sexAttrs" v-model="sex" select name="sex">
        <option :value="0">
          男
        </option>
        <option :value="1">
          女
        </option>
      </select>
      <span text-red>{{ errors.sex }}</span>

      <label label for="phone">手机号</label>
      <input v-bind="phoneAttrs" v-model="phone" input type="text" name="phone">
      <span text-red>{{ errors.phone }}</span>

      <FormItemCheckBox v-model:model-value="tts" label="TTS" name="tts" :attrs="ttsAttrs" />

      <FormItemCheckBox v-model:model-value="loc_share" label="位置共享" name="loc_share" :attrs="loc_shareAttrs" />

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        创建
      </button>
    </form>
  </div>
</template>

<style scoped>
select {
  --at-apply: p2 rounded bg-secondary;
}
</style>

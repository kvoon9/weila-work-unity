<script setup lang="ts">
import type { OrgChangeModel, OrgChangePayload } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'

definePageMeta({
  layout: 'dashboard',
  name: '我的企业',
})

const { data, isFetching, org_num, refetch } = useCorp()

const editSchema = z.object({
  name: z.string().max(20),
  avatar: z.string().optional(),
})

const editForm = useForm({
  validationSchema: toTypedSchema(editSchema),
})

const avatarRef = templateRef<any>('avatarRef')

const { $v1 } = useNuxtApp()

const isEditOpen = ref(false)
watchEffect(() => {
  if (isEditOpen.value) {
    editForm.setFieldValue('name', data.value?.name)
    editForm.setFieldValue('avatar', data.value?.avatar)
  }
})
const { mutate: edit } = useMutation({
  mutationFn: async (values: z.infer<typeof editSchema>) => {
    const { upload } = avatarRef.value

    const avatar = values.avatar && !isRemoteImage(values.avatar)
      ? await upload()
      : values.avatar

    const body: OrgChangePayload = {
      ...values,
      avatar,
      org_num: org_num.value!,
    }

    return $v1<OrgChangeModel>(weilaApiUrl('/corp/web/org-change'), { body })
  },
  onSuccess() {
    const { toast } = useToast()
    isEditOpen.value = false
    toast({ title: '编辑成功' })
    refetch()
  },
})
</script>

<template>
  <div>
    <Skeleton v-if="isFetching" />
    <Card v-if="data">
      <CardHeader class="flex md:flex-row space-y-4 md:space-x-4 md:items-center text-center md:text-left">
        <img
          :src="data?.avatar || '/default-avatar.png'" :alt="data?.name || 'Organization'"
          class="rounded border-2 object-cover size-20 max-md:mx-auto"
        >
        <div class="max-md:space-y-4">
          <CardTitle>
            {{ data.name }}
          </CardTitle>
          <CardDescription>创建日期：{{ data.created }}</CardDescription>
        </div>
      </CardHeader>
      <CardContent class="grid gap-4">
        <Table>
          <TableCaption />
          <TableHeader>
            <TableRow>
              <TableHead>
                群成员数
              </TableHead>
              <TableHead>
                群组数
              </TableHead>
              <TableHead>
                设备数
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell class="font-medium">
                {{ data.member_cnt }}
              </TableCell>
              <TableCell>{{ data.group_cnt }}</TableCell>
              <TableCell>{{ data.device_cnt }}</TableCell>
              <!-- <TableCell class="text-right">
                $250.00
              </TableCell> -->
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Dialog v-model:open="isEditOpen">
          <DialogTrigger as-child>
            <Button class="w-full md:w-fit md:ml-auto" size="lg">
              <LucideEdit /> 编辑
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[425px] ">
            <DialogHeader>
              <DialogTitle>编辑</DialogTitle>
              <DialogDescription>
                编辑企业信息
              </DialogDescription>
            </DialogHeader>
            <AutoForm
              class="space-y-2 px-4"
              :schema="editSchema"
              :form="editForm"
              :field-config="{
                name: { label: '名称' },
              }"
              @submit="edit"
            >
              <template #avatar="slotProps">
                <AutoFormField v-bind="slotProps" field-name="头像" class="w-full">
                  <AutoFormFieldAvatar v-bind="slotProps" ref="avatarRef" />
                </AutoFormField>
              </template>
              <Button type="submit" class="float-right">
                提交
              </Button>
            </AutoForm>
            <DialogFooter />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
    <Card v-else class="w-[350px] md:w-[500px] mx-auto md:mt-32">
      <CardHeader>
        <CardTitle>创建企业</CardTitle>
        <CardDescription>填写企业信息以创建企业</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateOrgForm />
      </CardContent>
    </Card>
  </div>
</template>

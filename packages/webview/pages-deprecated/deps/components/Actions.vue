<script setup lang="ts">
import type { Data } from './DataTable/columns'
import type { DeptChangeModel, DeptChangePayload, DeptDeleteModel, DeptDeletePayload, MemberChangeModel, MemberChangePayload, MemberGetallModel } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useToast } from '~/components/ui/toast/use-toast'
import { weilaApiUrl } from '~/plugins/api'

const props = defineProps<{
  item: Data[number]
}>()

const emits = defineEmits(['done'])

const router = useRouter()

const editDeptSchema = z.object({
  name: z.string().max(20),
})
const editDeptForm = useForm({
  validationSchema: toTypedSchema(editDeptSchema),
})

const { toast } = useToast()
const { $v1 } = useNuxtApp()
const { org_num } = useCorp()

const isEditOpen = ref(false)

watchEffect(() => {
  if (isEditOpen.value === true) {
    editDeptForm.setFieldValue('name', props.item.name)
  }
})

const { mutate: edit, isPending: isEditing } = useMutation({
  mutationFn: (body: DeptChangePayload) => $v1<DeptChangeModel>(
    weilaApiUrl('/corp/web/dept-change'),
    { body },
  ),
  onSuccess() {
    toast({ title: '编辑成功' })
    isEditOpen.value = false
    emits('done')
  },
})

const isDeleteOpen = ref(false)
const { mutate: deleteDept, isPending: isDeleting } = useMutation({
  mutationFn: (body: DeptDeletePayload) => $v1<DeptDeleteModel>(
    weilaApiUrl('/corp/web/dept-delete'),
    { body },
  ),
  onSuccess() {
    toast({ title: '操作成功' })
    isDeleteOpen.value = false
    emits('done')
  },
})

const { data: members } = useAllMember()

const isAddMemberOpen = shallowRef(false)
const changeMembersDeptList = ref<Set<number>>(new Set())

const { mutate: changeMembersDept, isPending } = useMutation({
  mutationFn: () => {
    const bodys: MemberChangePayload[] = Array.from(changeMembersDeptList.value).map((user_id) => {
      const member = members.value?.find(member => member.user_id === user_id)
      if (member) {
        const { user_id: member_id, name, job_num, sex, avatar, phone, tts, loc_share, track } = member
        const { org_num } = useCorp()
        return {
          org_num: org_num.value!,
          member_id,
          name,
          job_num,
          dept_id: props.item.id,
          sex,
          avatar,
          phone,
          tts,
          loc_share,
          track,
        }
      }
      else {
        return null
      }
    }).filter(value => !!value)

    return Promise.all(
      bodys.map((body) => {
        return $v1<MemberChangeModel>(weilaApiUrl('/corp/web/member-change'), {
          body,
        })
      }),
    )
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '添加成功' })
    isAddMemberOpen.value = false
    useAllMember().refetch()
    useDepts().refetch()
  },
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        操作
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-fit">
      <DropdownMenuLabel>操作</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuItem @click="router.push(`/members/${item.name}`)">
        <LucideEye class="mr-2" />
        <span>查看成员</span>
      </DropdownMenuItem>
      <!-- <DropdownMenuItem @click="isAddMemberOpen = true">
        <Icon name="ph:plus-circle-bold" class="mr-2" />
        <span>添加成员</span>
      </DropdownMenuItem> -->
      <DropdownMenuItem @click="isEditOpen = true">
        <LucideEdit class="mr-2 h-4 w-4" />
        <span>编辑</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
      <DropdownMenuItem @click="isDeleteOpen = true">
        <LucideDelete class="mr-2 h-4 w-4" />
        <span>删除</span>
        <!-- <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> -->
      </DropdownMenuItem>
    </DropdownMenuContent>

    <Dialog v-model:open="isEditOpen">
      <DialogTrigger as-child>
        <!-- <Button size="sm">
          编辑
        </Button> -->
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑部门</DialogTitle>
          <DialogDescription>
            填写部门信息以编辑部门
          </DialogDescription>
        </DialogHeader>
        <AutoForm
          class="space-y-2 px-4"
          :form="editDeptForm"
          :schema="editDeptSchema"
          :field-config="{
            name: {
              label: '名称',
            },
          }"
          @submit="(values) => edit({
            ...values,
            org_num: org_num!,
            dept_id: item.id,
          })"
        >
          <Button v-is-loading="isEditing" type="submit" class="float-right">
            提交
          </Button>
        </AutoForm>
        <DialogFooter />
      </DialogContent>
    </Dialog>
    <Dialog v-model:open="isDeleteOpen">
      <DialogTrigger as-child>
        <!-- <Button size="sm" variant="destructive">
          删除
        </Button> -->
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除部门</DialogTitle>
          <DialogDescription>
            删除部门:{{ item.name }}
          </DialogDescription>
        </DialogHeader>
        <div>
          确定要删除吗? 此操作无法撤回
        </div>
        <DialogFooter>
          <Button
            v-is-loading="isDeleting" variant="destructive" @click="() => deleteDept({
              org_num: org_num!,
              dept_id: item.id,
            })"
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isAddMemberOpen">
      <DialogTrigger />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加成员</DialogTitle>
          <DialogDescription>
            将成员添加到 <span class="text-neutral-700">{{ item.name }}</span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea class="h-[200px]  rounded-lg border ">
          <div v-for="member in members" :key="member.user_id" class="space-x-2 py-4 border px-4 flex items-center">
            <Checkbox
              :id="`${member.user_id}`" @update:checked="(select) => {
                if (select) {
                  changeMembersDeptList.add(member.user_id)
                }
                else {
                  changeMembersDeptList.delete(member.user_id)
                }
              }"
            />
            <Label :for="`${member.user_id}`" class="space-x-2 flex items-center">
              <span>{{ member.name }}</span>
              <Badge variant="outline">
                {{ member.user_num }}
              </Badge>
              <span v-if="member.dept_name" class="text-gray-400">({{ member.dept_name }})</span>
            </Label>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button v-is-loading="isPending" @click="changeMembersDept">
            提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </DropdownMenu>
</template>

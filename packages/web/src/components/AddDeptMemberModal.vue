<script setup lang="ts">
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import { ref as deepRef, shallowRef } from 'vue'

const props = defineProps<{
  deptId: number
}>()

const qc = useQueryClient()
const { t } = useI18n()

const open = shallowRef(false)

const checkedKeys = deepRef<string[]>([])
const checkedMemberKeys = computed(() => checkedKeys.value.filter(i => i.startsWith('member-')))

const { data: deptMembers, refetch } = useWeilaFetch<Member[]>('corp/address/get-dept-all-member', {
  body: { dept_id: props.deptId },
})

watchEffect(() => open.value && refetch())

const { mutate, isPending } = useWeilaMutation<never, {
  dept_id: number
  user_ids: number[]
}>('corp/address/add-dept-members', {
  onSuccess() {
    Message.success(t('message.success'))
    open.value = false
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-member-list'] })
  },
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="data-[state=open]:animate-overlayShow fixed inset-0 z-100 bg-black:60" />
      <DialogContent
        bg-base
        class="fixed left-[50%] top-[50%] z-[100] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in bg-base focus:outline-none"
        @interact-outside="event => {
          const target = event.target as HTMLElement;
          console.log(target)
          if (target?.closest('.arco-select-option')) return event.preventDefault()
        }"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          添加部门成员
        </DialogTitle>

        <div relative p4 min-w-100 max-h-60vh of-y-auto>
          <ContactSelectTree
            v-model:checked-keys="checkedKeys"
            :uncheckable-ids="deptMembers.map(i => i.user_id)"
          />
        </div>

        <div class="mt-[25px] flex justify-end">
          <DialogClose as-child>
            <a-button>
              {{ t('button.cancel') }}
            </a-button>
          </DialogClose>
          <a-button
            type="primary" :disabled="!checkedMemberKeys?.length" :loading="isPending" @click="() => mutate({
              dept_id: Number(props.deptId),
              user_ids: checkedKeys.filter((key) => key.startsWith('member')).map((key) => {
                return Number(key.replace('member-', ''))
              }),
            })"
          >
            {{ t('button.submit') }}
          </a-button>
        </div>
        <DialogClose
          class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-gray2 focus:shadow-[0_0_0_2px] focus:shadow-gray7 focus:outline-none"
          aria-label="Close"
        >
          <i i-carbon-close />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import type { TransferItem } from '@arco-design/web-vue/es/transfer/interface';
import type { Member } from '~/types/api';
import { Message } from '@arco-design/web-vue';
import { ref as deepRef, shallowRef } from 'vue';

const props = defineProps<{
  groupId: number
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = shallowRef(false)

const selectedIds = deepRef<string[]>([])
$inspect(selectedIds)

const value: string[] = []

const { data: groupMembers, refetch: refetchGroupMembers, isFetching: isFetchingGroupMember } = useWeilaFetch<Member[]>(
  () => `corp/group/get-group-all-member`,
  {
    body: () => ({
      group_id: Number(props.groupId),
    }),
  },
)

const { data: memberListData, isFetching: isFetchingMemberList } = useWeilaFetch<{
  count: number
  members: Member[]
}>('corp/address/get-member-list')

watch(open, (val) => {
  if (val) {
    refetchGroupMembers()
    selectedIds.value = []
  }
})

const data = computed(() => memberListData.value?.members
  .filter(member => !groupMembers.value?.find(i => i.user_id === member.user_id))
  .map((member): TransferItem => ({
    label: `${member.name}(${member.user_num})`,
    value: String(member.user_id),
    disabled: false,
  })) || [])

const { mutate, isPending } = useWeilaMutation('corp/group/add-group-members', {
  onSuccess() {
    Message.success(t('message.success'))
    open.value = false
    emits('success')
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
          {{ t('button.add-group-member') }}
        </DialogTitle>

        <div relative p4>
          <LoadingMask :open="isFetchingGroupMember || isFetchingMemberList" />
          <a-transfer
            v-model:model-value="selectedIds" simple :title="[t('corp.member'), t('group.member')]" show-search
            :data="data" :default-value="value"
          />
        </div>

        <div class="mt-[25px] flex justify-end">
          <DialogClose as-child>
            <a-button>
              {{ t('button.cancel') }}
            </a-button>
          </DialogClose>
          <a-button
            type="primary" :disabled="!selectedIds?.length" :loading="isPending" @click="() => mutate({
              group_id: Number(props.groupId),
              user_ids: selectedIds.map(Number),
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

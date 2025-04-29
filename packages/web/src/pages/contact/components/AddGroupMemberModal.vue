<script setup lang="ts">
import type { TransferItem } from '@arco-design/web-vue/es/transfer/interface'
import type { GroupMemberAddPayload, GroupMemberGetallModel } from 'generated/mock/weila'
import type { MemberModel } from '~/api/contact'
import { Message } from '@arco-design/web-vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { ref as deepRef, shallowRef } from 'vue'
import { weilaApiUrl } from '~/api'

const props = defineProps<{
  groupId: number
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = shallowRef(false)

const selectedIds = deepRef<string[]>([])
$inspect(selectedIds)

const form = reactive<GroupMemberAddPayload>({
  group_id: props.groupId,
  member_ids: [],
})

const value: string[] = []

$inspect(form)

const { org_num } = storeToRefs(useCorpStore())

const { data: members, isFetching: isFetchingMembers } = useQuery<Array<MemberModel>>({
  enabled: computed(() => Boolean(org_num.value)),
  queryKey: [weilaApiUrl('/corp/web/member-getall'), org_num.value],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/member-getall'), {
    body: {
      org_num: org_num.value,
    },
  }).then(i => i.members),
})

const { data: groupMembers, refetch: refetchGroupMembers, isFetching: isFetchingGroupMembers } = useQuery<GroupMemberGetallModel['data']['members']>({
  enabled: computed(() => Boolean(open.value)),
  queryKey: [weilaApiUrl('/corp/web/group-member-getall'), props.groupId],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/group-member-getall'), {
    body: {
      group_id: props.groupId,
    },
  }).then(i => i.members),
})

watch(open, (val) => {
  if (!val)
    return

  refetchGroupMembers().then(() => {
    selectedIds.value = groupMembers.value?.map(i => String(i.user_id)) || []
  })
})

const data = computed(() => members.value?.map((member): TransferItem => {
  return {
    label: `${member.name}(${member.user_num})`,
    value: String(member.user_id),
    disabled: false,
  }
}) || [])

const { mutate, isPending } = useMutation({
  mutationFn: () => {
    return $weilaRequestV1.post('/corp/web/group-member-add', {
      group_id: Number(props.groupId),
      member_ids: selectedIds.value,
    })
  },
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
          <LoadingMask :open="isFetchingGroupMembers || isFetchingMembers" />
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
          <a-button type="primary" :disabled="!selectedIds?.length" :loading="isPending" @click="() => mutate()">
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

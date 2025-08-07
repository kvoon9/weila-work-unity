<script setup lang="ts">
import type { GroupMemberModel } from '~/api/contact'
import Message from '@arco-design/web-vue/es/message'
import { shallowRef } from 'vue'

defineProps<{
  groupId?: number
  member?: GroupMemberModel
}>()

const emits = defineEmits(['success'])

const { t } = useI18n()

const open = shallowRef(false)

const { mutateAsync, isPending } = useWeilaMutation<{
  group_id: number
  user_id: number
}>('corp/group/delete-group-member', {
  onSuccess() {
    open.value = false
    Message.success(t('message.success'))
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
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in focus:outline-none"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          {{ t('delete.modal.title') }}
        </DialogTitle>

        <a-list my-4>
          <a-list-item v-if="member">
            {{ member.name }} ({{ member.user_num }})
          </a-list-item>
        </a-list>

        <DialogDescription>
          {{ t('delete.modal.hint') }} {{ t('delete.modal.content') }}
        </DialogDescription>

        <div class="mt-[25px] flex justify-end">
          <DialogClose as-child>
            <a-button>
              {{ t('button.cancel') }}
            </a-button>
          </DialogClose>
          <a-button
            type="primary" :loading="isPending" :disabled="!member" @click="(e) => mutateAsync({
              group_id: groupId,
              user_id: member?.user_id,
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

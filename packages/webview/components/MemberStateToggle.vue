<!-- eslint-disable vue/prop-name-casing -->
<script setup lang="ts">
import type { MemberChangeStateModel, MemberGetallModel } from '~/fixture/mock'
import { useMutation } from '@tanstack/vue-query'
import { shallowRef } from 'vue'
import { useDeptList } from '~/composables/deptList'
import { useMemberList } from '~/composables/memberList'
import { weilaApiUrl } from '~/plugins/api'

const props = defineProps<{
  member: MemberGetallModel['data']['members'][number]
}>()

const { $v1 } = useNuxtApp()
const { org_num } = useCorp()

const memberState = shallowRef(props.member.state === 0)

const { mutate: toggleState, isPending } = useMutation({
  mutationFn: (state: boolean) =>
    $v1<MemberChangeStateModel>(weilaApiUrl('/corp/web/member-change-state'), {
      body: {
        org_num: org_num.value,
        member_id: props.member.user_id,
        state: state ? 1 : 0,
      },
    }),
  onSuccess() {
    const { toast } = useToast()
    toast({ title: '状态切换成功' })
    useMemberList().refetch()
    useDeptList().refetch()
    memberState.value = !memberState.value
  },
})
</script>

<template>
  <!-- <button
    btn-outline
    :class="member.state === 0 ? 'color-green border-green' : 'color-neutral border-neutral'"
    mra
    ml0
    flex="~ items-center" space-x-1
    :disabled="isPending"
    @click.prevent="() => toggleState()"
  >
    <Icon v-if="isPending" name="svg-spinners:bars-rotate-fade" class="min-w-4" />
    {{ member.state === 0 ? '启用' : '停用' }}
  </button> -->

  <div class="flex items-center justify-between border rounded p2 bg-neutral-100">
    <label
      class="text-stone-700 dark:text-white leading-none pr-2 select-none"
      for="airplane-mode"
    >
      启用/停用成员
    </label>

    <SwitchRoot
      id="airplane-mode"
      :model-value="memberState"
      class="w-[64px] h-[40px] shadow-sm flex data-[state=unchecked]:bg-stone-300 data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-stone-800 dark:data-[state=checked]:bg-stone-700 border border-stone-300 data-[state=checked]:border-stone-700  dark:border-stone-700 rounded-full relative transition-[background] focus-within:outline-none focus-within:shadow-[0_0_0_1px] focus-within:border-stone-800 focus-within:shadow-stone-800"
      @update:model-value="() => toggleState(memberState)"
    >
      <SwitchThumb
        class="size-7 my-auto bg-white text-xs flex items-center justify-center shadow-xl rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-full"
      >
        <Icon v-if="isPending" name="svg-spinners:bars-rotate-fade" class="min-w-4" />
      </SwitchThumb>
    </SwitchRoot>
  </div>
</template>

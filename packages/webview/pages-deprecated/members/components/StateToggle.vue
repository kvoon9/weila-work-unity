<!-- eslint-disable vue/prop-name-casing - for defineProps -->
<script setup lang="ts">
// import type { MemberChangeStateModel } from '~/fixture/mock'
// import { useMutation } from '@tanstack/vue-query'
// import { weilaApiUrl } from '~/plugins/api'
import { useStateToggle } from './stateToggle'

const props = defineProps<{
  state: 0 | 1
  member_id: number
}>()

const state = ref<0 | 1>(props.state)

const { refetch: refetchMember } = useAllMember()

const { mutate: toggle, isPending } = useStateToggle()
$inspect(state)
</script>

<template>
  <button
    class="text-white py-1 px-2 rounded-md break-keep text-wrap w-full"
    :class="state === 0 ? 'bg-primary-500 ' : 'bg-gray-400'"
    @click="() => toggle({ member_id, state }, {
      onSuccess({ state: newVal }) {
        state = newVal as 0 | 1
        refetchMember()
      },
    })"
  >
    <span class="flex gap-4 items-center">
      <Icon v-if="isPending" name="svg-spinners:bars-rotate-fade" class="min-w-4" />
      <Icon v-else :name="state === 0 ? 'ph:check' : 'ph:x'" />
      {{ state === 0 ? '启用' : '停用' }}
    </span>
  </button>
</template>

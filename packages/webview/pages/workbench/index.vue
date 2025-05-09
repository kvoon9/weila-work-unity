<script setup lang="ts">
definePageMeta({
  layout: 'home',
})

const router = useRouter()

appHead.value = '工作台'

const { hasBusiness, isVerified, serviceState, myBusinessQuery, isSuccess: isGetServiceSuccess, isPending: isGetServicePending } = useService()

const serviceRoute = computed(() => {
  if (hasBusiness.value && isVerified.value)
    return `/workbench/service/${myBusinessQuery.data.value?.id}-${myBusinessQuery.data.value?.sid}/point`

  if (!isVerified.value)
    return '/workbench/service/set-license'

  if (!hasBusiness.value)
    return '/workbench/service/create'

  return '/workbench/service/set-license'
})
</script>

<template>
  <div>
    <div class="grid grid-cols-3 gap-4" p4>
      <!-- <div text-center bg-neutral-100 rounded-md p4>
        <Icon mxa size-8 name="ph:map-pin" mode="svg" />
        成员轨迹
      </div> -->
      <button
        text-center bg-neutral-100 rounded-md p4
        :disabled="!isGetServiceSuccess"
        @click="() => router.push(serviceRoute)"
      >
        <Icon mxa size-8 name="ph:users" mode="svg" />
        <div>服务号</div>
        <div v-if="isGetServiceSuccess" text-sm text-neutral-500>
          ({{ serviceState }})
        </div>
        <Icon v-if="isGetServicePending" name="svg-spinners:bars-rotate-fade" mxa />
      </button>
      <!-- <div text-center bg-neutral-100 rounded-md p4>
        <Icon mxa size-8 name="ph:chat-centered-dots" mode="svg" />
        历史消息
      </div> -->
      <!-- <NuxtLink to="./workbench/service-adt" text-center bg-neutral-100 rounded-md p4>
        <Icon mxa size-8 name="ph:chat-centered-dots" mode="svg" />
        服务号审核
      </NuxtLink> -->
    </div>
  </div>
</template>

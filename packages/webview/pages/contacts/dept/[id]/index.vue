<script setup lang="ts">
definePageMeta({
  layout: 'back',
})

const route = useRoute('contacts-dept-id___zh-CN')
const deptId = computed(() => Number(route.params.id))

const dept = useDept(deptId)

appHead.value = `${dept.value?.name}`
</script>

<template>
  <div>
    <MemberList :dept-id="deptId" />
    <TheTitleRightMenu :routes="route.path">
      <NuxtLink
        :to="`./${route.params.id}/edit`"
      >
        <Icon name="ph:gear" />
      </NuxtLink>
    </TheTitleRightMenu>
  </div>
</template>

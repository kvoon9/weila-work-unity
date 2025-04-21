<script setup lang="ts">
definePageMeta({
  layout: 'back',
})

const { data } = useMyBusiness()

watchEffect(() => {
  if (data.value)
    appHead.value = data.value.merchant.name
})
</script>

<template>
  <div>
    123
  </div>
</template>

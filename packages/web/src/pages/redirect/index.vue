<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'

definePage({
  meta: {
    requiresAuth: false,
  },
})

const router = useRouter()
const route = useRoute()

// FIXME: type error
// @ts-expect-error type error
const gotoPath = route.params.path as string

router.replace({ path: gotoPath })
</script>

<template>
  <div />
</template>

<style scoped lang="less"></style>

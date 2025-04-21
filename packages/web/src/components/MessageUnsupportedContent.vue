<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <p mt1 max-w-40vw w-fit break-words rounded p4 text-neutral>
    [{{ t('message.not-support') }}]
  </p>
</template>

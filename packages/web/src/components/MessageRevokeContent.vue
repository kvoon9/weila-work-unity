<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <p mt1 max-w-40vw w-fit break-words rounded p4 color-neutral>
    [{{ t('message.revoke') }}]
  </p>
</template>

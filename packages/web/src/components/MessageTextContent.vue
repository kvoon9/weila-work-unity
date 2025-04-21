<script setup lang="tsx">
import { emojify } from '~/utils/emoji'

defineProps<{
  content: string
}>()
</script>

<template>
  <!-- TODO: safe parse -->
  <p mt1 max-w-40vw w-fit break-words rounded p4 v-html="emojify(content)" />
</template>

<script setup lang="tsx">
import { emojiMap } from '~/shared/states'

defineProps<{
  content: string
}>()

function emojify(text: string) {
  for (const keyword in emojiMap) {
    if (text.includes(keyword)) {
      const src = emojiMap[keyword].default
      text = text.replaceAll(keyword, `<img src=${src} style="width: 2rem; height: 2rem; display: inline; transform: translateY(-8px);" />`)
    }
  }

  return text
}
</script>

<template>
  <!-- TODO: safe parse -->
  <p class="mt-1 max-w-60vw w-fit break-words rounded p-4 translate-y-0" v-html="emojify(content)" />
</template>

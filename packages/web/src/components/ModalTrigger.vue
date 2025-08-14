<script setup lang="ts">
import type { ButtonProps, ModalConfig } from '@arco-design/web-vue'

withDefaults(defineProps<{
  title: string
  trigger?: ButtonProps
  modal?: Omit<ModalConfig, 'content' | 'footer'>
}>(), {
  trigger: () => ({}),
  modal: () => ({}),
})

const slots = defineSlots<{
  default: (props: object) => any
  content: (props: object) => any
  footer: (props: object) => any
}>()

const open = defineModel('open', { default: false })
</script>

<template>
  <div inline-block @click="open = true">
    <slot>
      <a-button w-full v-bind="trigger">
        {{ title }}
      </a-button>
    </slot>
  </div>
  <a-modal v-if="open" v-bind="modal" v-model:visible="open" :footer="!!slots.footer" :title>
    <slot name="content" />

    <template #footer>
      <slot name="footer" />
    </template>
  </a-modal>
</template>

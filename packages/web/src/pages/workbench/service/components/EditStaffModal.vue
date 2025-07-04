<script setup lang="ts">
import { defineProps, shallowRef } from 'vue'

const props = defineProps<{
  staff: any
}>()

const isEditStaffModalOpen = shallowRef(true)
</script>

<template>
  <TheModal v-model:open="isEditStaffModalOpen" title="编辑客服">
    <template #content>
      <div>
        <!-- 这里可以放表单，暂时留空 -->
        <div>姓名：{{ staff.name }}</div>
      </div>
    </template>
    <template #footer>
      <a-button type="primary">
        保存
      </a-button>
    </template>
  </TheModal>
</template>

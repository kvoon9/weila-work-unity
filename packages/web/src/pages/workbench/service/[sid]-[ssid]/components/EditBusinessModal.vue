<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useMutateBusiness, useMyBusiness } from '@weila/network'

const { t } = useI18n()

const isEditBusinessModalOpen = shallowRef(false)

const { data: businessData } = useMyBusiness($v2)
const { mutateAsync: changeBusiness, isPending: isChangingBusiness } = useMutateBusiness($v2, {
  onSuccess() {
    isEditBusinessModalOpen.value = false
    Message.success('修改成功')
  },
})

const form = reactive({
  name: businessData.value?.merchant?.name || '',
  phone: businessData.value?.merchant?.phone || '',
})
</script>

<template>
  <TheModal
    v-model:open="isEditBusinessModalOpen"
    title="编辑服务号信息"
  >
    <a-button type="primary">
      编辑
    </a-button>
    <template #content>
      <a-form :model="form">
        <a-form-item field="name" :label="t('org-form.name.label')">
          <a-input v-model="form.name" :max-length="20" show-word-limit />
        </a-form-item>
        <a-form-item field="phone" label="电话">
          <a-input v-model="form.phone" :max-length="13" show-word-limit />
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-button
        :disabled="isChangingBusiness"
        :loading="isChangingBusiness"
        type="primary" @click="() => changeBusiness({
          business: {
            ...businessData!,
            merchant: {
              ...form,
              ...businessData!.merchant,
            },
          },
        })"
      >
        保存
      </a-button>
    </template>
  </TheModal>
</template>

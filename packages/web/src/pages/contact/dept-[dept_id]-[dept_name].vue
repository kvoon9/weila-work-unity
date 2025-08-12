<script setup lang="ts">
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
import { shallowRef } from 'vue'

const curPage = shallowRef(0)
const pageSize = shallowRef(10)

const route = useRoute('/contact/dept-[dept_id]-[dept_name]')
const { data, refetch } = useWeilaFetch<{
  count: number
  members: Member[]
}>(
  () => `corp/address/get-dept-member-list?page=${curPage.value}&size=${pageSize.value}`,
  {
    body: () => ({
      dept_id: Number(route.params.dept_id),
    }),
  },
)

const { t } = useI18n()

const filterInput = shallowRef('')

const members = computed(() => {
  if (!data.value?.members)
    return []

  if (!filterInput.value)
    return data.value.members

  const searchTerm = filterInput.value.toLowerCase()

  return data.value.members
    .filter(member =>
      member.name.toLowerCase().includes(searchTerm)
      || member.phone.toLowerCase().includes(searchTerm)
      || member.user_num.toLowerCase().includes(searchTerm)
      || member.job_num.toLowerCase().includes(searchTerm),
    )
    .sort((a, b) => a.dept_id - b.dept_id)
})

const isEditMemberModalOpen = shallowRef(false)
const isEditDeviceModalOpen = shallowRef(false)
// const isResetPasswordModalVisible = shallowRef(false)
const isDeleteMemberModalOpen = shallowRef(false)

const qc = useQueryClient()
const { mutate } = useWeilaMutation<never, {
  dept_id: number
  user_id: number
}>('corp/address/delete-dept-member', {
  onSuccess() {
    isDeleteMemberModalOpen.value = false
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-member-list'] })
    Message.success(t('message.success'))
  },
})
</script>

<template>
  <a-page-header
    title="部门管理"
    @back="$router.back"
  >
    <template #breadcrumb>
      <a-breadcrumb>
        <a-breadcrumb-item>部门列表</a-breadcrumb-item>
        <a-breadcrumb-item>{{ route.params.dept_name }}</a-breadcrumb-item>
      </a-breadcrumb>
    </template>
    <a-card>
      <template #title>
        <a-space>
          <AddDeptMemberModal :dept-id="Number(route.params.dept_id)" @success="refetch">
            <a-button type="primary">
              <i i-ph-plus inline-block /> 添加成员
            </a-button>
          </AddDeptMemberModal>
          <a-input
            v-model="filterInput" :max-length="20" show-word-limit
            :placeholder="`${t('name')}/${t('job-number')}/${t('weila-number')}/${t('phone-number')}`" allow-clear
            max-w-80
          />
        <!-- <a-select v-model:model-value="selectedDepts" :placeholder="t('dept.name')" allow-search allow-clear
          size="large" w-50>
          <a-option v-for="dept in depts" :key="dept.id">
            {{ dept.name }}
          </a-option>
        </a-select> -->
        </a-space>
      </template>

      <MemberTable v-model:page="curPage" :members :count="data?.count || 0">
        <template #actions="{ record }">
          <a-space>
            <a-button
              @click="record.type === 1
                ? isEditDeviceModalOpen = true
                : isEditMemberModalOpen = true"
            >
              {{ t('button.edit') }}
            </a-button>
            <!-- <a-doption v-if="type !== 1" @click="isResetPasswordModalVisible = true">
                {{ t('reset-password.button') }}
              </a-doption> -->
            <a-button status="danger" @click="isDeleteMemberModalOpen = true">
              {{ t('button.delete') }}
            </a-button>
          </a-space>
        </template>
        <template #bottom="{ selected }">
          <EditMemberModal v-model:open="isEditMemberModalOpen" :member="selected" />
          <EditDeviceModal v-model:open="isEditDeviceModalOpen" :member="selected" />
          <!-- <ResetPasswordModal v-model:open="isResetPasswordModalVisible" :member="selected" /> -->
          <TheModal v-model:open="isDeleteMemberModalOpen" :title="t('delete.modal.title')">
            <template #content>
              {{ t('delete.modal.hint') }} {{ t('delete.modal.content') }}
            </template>
            <template #footer>
              <a-button
                type="primary" @click="mutate({
                  dept_id: Number(route.params.dept_id),
                  user_id: selected!.user_id,
                })"
              >
                {{ t('button.submit') }}
              </a-button>
            </template>
          </TheModal>
        </template>
      </MemberTable>
    </a-card>
  </a-page-header>

  <div w-full p4 space-y-4>
    <div w-full rounded p4 space-y-4 bg-base />
  </div>
</template>

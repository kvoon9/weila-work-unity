<script setup lang="ts">
import type { Member } from '~/types/api'
import { shallowRef } from 'vue'

definePage({
  alias: 'member',
  meta: {
    name: '成员管理',
  },
})

const { t } = useI18n()

const filterInput = shallowRef('')

const curPage = shallowRef(0)
const pageSize = shallowRef(10)

const { data, refetch } = useWeilaFetch<{
  count: number
  members: Member[]
}>(() => `corp/address/get-member-list?page=${curPage.value}&size=${pageSize.value}`)

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

const isEditMemberModalVisible = shallowRef(false)
const isEditDeviceModalVisible = shallowRef(false)
// const isResetPasswordModalVisible = shallowRef(false)
const isDeleteMemberModalVisible = shallowRef(false)
</script>

<template>
  <div w-full p4 space-y-4>
    <div w-full rounded p4 space-y-4 bg-base>
      <section flex items-center space-x-2>
        <CreateMemberModal @success="refetch">
          <a-button type="primary">
            <i i-ph-plus inline-block /> {{ t('button.create-member') }}
          </a-button>
        </CreateMemberModal>
        <AddDeviceModal @success="refetch">
          <a-button type="primary">
            <i i-ph-plus inline-block /> {{ t('button.add-device') }}
          </a-button>
        </AddDeviceModal>
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
      </section>
      <MemberTable v-model:page="curPage" :members :count="data?.count || 0">
        <template #actions="{ record }">
          <a-doption v-if="record.type !== 1" @click="isEditMemberModalVisible = true">
            {{ t('button.edit') }}
          </a-doption>
          <!-- <a-doption v-if="type !== 1" @click="isResetPasswordModalVisible = true">
              {{ t('reset-password.button') }}
            </a-doption> -->
          <a-doption @click="isDeleteMemberModalVisible = true">
            {{ t('button.delete') }}
          </a-doption>
        </template>
        <template #bottom="{ selected }">
          <EditMemberModal v-model:open="isEditMemberModalVisible" :member="selected" />
          <EditDeviceModal v-model:open="isEditDeviceModalVisible" :member="selected" />
          <!-- <ResetPasswordModal v-model:open="isResetPasswordModalVisible" :member="selected" /> -->
          <DeleteMemberModal v-model:open="isDeleteMemberModalVisible" :member="selected" />
        </template>
      </MemberTable>
    </div>
  </div>
</template>

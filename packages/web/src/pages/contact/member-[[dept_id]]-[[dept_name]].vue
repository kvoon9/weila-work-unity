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

const isCreateMemberModalVisible = shallowRef(false)
const isAddDeviceModalVisible = shallowRef(false)
const isEditMemberModalVisible = shallowRef(false)
const isEditDeviceModalVisible = shallowRef(false)
// const isResetPasswordModalVisible = shallowRef(false)
const isDeleteMemberModalVisible = shallowRef(false)
</script>

<template>
  <a-page-header
    :show-back="false"
    :title="$route.meta.name"
  >
    <a-card>
      <template #title>
        <a-space>
          <a-button type="primary" @click="isCreateMemberModalVisible = true">
            {{ t('button.create-member') }}
          </a-button>

          <a-button type="primary" @click="isAddDeviceModalVisible = true">
            {{ t('button.add-device') }}
          </a-button>
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
            <a-button @click="() => { isEditMemberModalVisible = true }">
              {{ t('button.edit') }}
            </a-button>
            <!-- <a-doption v-if="type !== 1" @click="isResetPasswordModalVisible = true">
              {{ t('reset-password.button') }}
            </a-doption> -->
            <a-button v-if="record.type !== 255" status="danger" @click="isDeleteMemberModalVisible = true">
              {{ t('button.delete') }}
            </a-button>
          </a-space>
        </template>
        <template #bottom="{ selected }">
          <CreateMemberModal v-if="isCreateMemberModalVisible" v-model:open="isCreateMemberModalVisible" @success="refetch" />
          <AddDeviceModal v-if="isAddDeviceModalVisible" v-model:open="isAddDeviceModalVisible" @success="refetch" />
          <EditMemberModal v-if="isEditMemberModalVisible" v-model:open="isEditMemberModalVisible" :member="selected" />
          <EditDeviceModal v-if="isEditDeviceModalVisible" v-model:open="isEditDeviceModalVisible" :member="selected" />
          <DeleteMemberModal v-if="isDeleteMemberModalVisible" v-model:open="isDeleteMemberModalVisible" :member="selected" />
          <!-- <ResetPasswordModal v-model:open="isResetPasswordModalVisible" :member="selected" /> -->
        </template>
      </MemberTable>
    </a-card>
  </a-page-header>
</template>

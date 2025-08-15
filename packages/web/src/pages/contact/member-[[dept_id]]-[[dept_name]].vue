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

const curPage = shallowRef(1)
const pageSize = shallowRef(10)

const { data } = useWeilaFetch<{
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
</script>

<template>
  <a-page-header :show-back="false" :title="$route.meta.name">
    <a-card>
      <template #title>
        <a-space>
          <CreateMemberModal />

          <AddDeviceModal />

          <a-input
            v-model="filterInput" :max-length="20" show-word-limit
            :placeholder="`${t('name')}/${t('job-number')}/${t('weila-number')}/${t('phone-number')}`" allow-clear
            max-w-80
          />
        </a-space>
      </template>

      <MemberTable v-model:page="curPage" :members :count="data?.count || 0">
        <template #actions="{ record, selected }">
          <a-space>
            <EditMemberModal :member="selected" />
            <DeleteMemberModal v-if="record.type !== 255" :member="selected" />
          </a-space>
        </template>
      </MemberTable>
    </a-card>
  </a-page-header>
</template>

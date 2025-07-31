<script setup lang="ts">
import type { Member } from '~/types/api'
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
      <MemberTable :members :count="data?.count || 0" />
    </div>
  </div>
</template>

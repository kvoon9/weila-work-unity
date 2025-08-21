<script setup lang="ts">
import type { DeptModel } from '~/api/contact'

import CreateDeptModal from './components/CreateDeptModal.vue'
import DeleteDeptModal from './components/DeleteDeptModal.vue'
import EditDeptModal from './components/EditDeptModal.vue'

definePage({
  meta: {
    name: '部门管理',
  },
})

const router = useRouter()

const { t } = useI18n()

interface Dept {
  id: number
  name: string
  user_count: number
}

const { data, refetch } = useWeilaFetch<{
  count: number
  dept: Dept
}>('corp/address/get-dept-list')

function onSelect(dept: DeptModel, e: PointerEvent) {
  // @ts-expect-error type error
  if (!e.target?.className?.includes('arco-table')) {
    return void 0
  }

  router.push(`/contact/dept-${dept.id}-${dept.name}`)
}
</script>

<template>
  <a-page-header
    :show-back="false"
    :title="$route.meta.name"
  >
    <a-card>
      <template #title>
        <a-space>
          <CreateDeptModal @success="refetch" />
        </a-space>
      </template>

      <!-- @vue-expect-error type error when arco's row-click -->
      <a-table
        :data="data?.depts" size="medium" :column-resizable="true" :scroll="{
          x: 1000,
          y: 600,
        }" :scrollbar="true" :columns="[{ title: t('name'), dataIndex: 'name' }]"
        @row-click="(...args) => onSelect(...args)"
      >
        <template #columns>
          <a-table-column :title="t('name')">
            <template #cell="{ record: { name } }">
              {{ name }}
            </template>
          </a-table-column>
          <a-table-column :title="t('user-count')">
            <template #cell="{ record: { user_count } }">
              {{ user_count || 0 }}
            </template>
          </a-table-column>
          <a-table-column :title="t('controls')">
            <template #cell="{ record }">
              <div v-if="record.id" flex gap2>
                <EditDeptModal :dept="record" />
                <DeleteDeptModal :dept="record" />
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </a-page-header>
</template>

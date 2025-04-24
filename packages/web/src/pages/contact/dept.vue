<script setup lang="ts">
import type { DeptModel } from '~/api/contact'
import { useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'

import CreateDeptModal from './components/CreateDeptModal.vue'
import DeleteDeptModal from './components/DeleteDeptModal.vue'
import EditDeptModal from './components/EditDeptModal.vue'

const router = useRouter()

const { t } = useI18n()
const { data: corp } = storeToRefs(useCorpStore())
const { data, refetch } = useQuery<Array<DeptModel>>({
  enabled: computed(() => Boolean(corp.value?.num)),
  queryKey: [weilaApiUrl('/corp/web/dept-getall'), corp],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/dept-getall'), {
    body: {
      org_num: corp.value!.num,
    },
  }).then(i => i.depts.sort((a: DeptModel, b: DeptModel) => a.id - b.id)),
})

$inspect(data)

const isEditDeptModalVisible = ref(false)
const selectedDept = ref<DeptModel | undefined>(undefined)

function openEdit(dept: DeptModel) {
  selectedDept.value = dept
  isEditDeptModalVisible.value = true
}

function onSelect(dept: DeptModel, e: PointerEvent) {
  const whitelistEl = ['.arco-btn']
  // @ts-expect-error type error: no closest attr
  if (whitelistEl.find(className => e.target?.closest(className))) {
    return void 0
  }

  router.push(`/contact/member-${dept.id}-${dept.name}`)
}
</script>

<template>
  <div w-full p4 space-y-4>
    <a-breadcrumb>
      <a-breadcrumb-item>{{ t('submenu.dept-manage') }}</a-breadcrumb-item>
      <!-- <a-breadcrumb-item>{{ t('member-list') }}</a-breadcrumb-item> -->
    </a-breadcrumb>
    <div w-full rounded p4 space-y-4 bg-base>
      <section space-x-2>
        <CreateDeptModal @success="refetch">
          <a-button type="primary">
            {{ t('button.create-dept') }}
          </a-button>
        </CreateDeptModal>
        <!-- <CreateMemberTrigger />
        <AddDeviceTrigger /> -->
      </section>

      <!-- @vue-expect-error type error when arco's row-click -->
      <a-table
        :data="data" size="medium" :column-resizable="true" :scroll="{
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
                <a-button @click="() => openEdit(record)">
                  {{ t('button.edit') }}
                </a-button>
                <DeleteDeptModal :dept="record" @success="refetch">
                  <a-button status="danger">
                    {{ t('button.delete') }}
                  </a-button>
                </DeleteDeptModal>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>

  <EditDeptModal v-model:open="isEditDeptModalVisible" :dept="selectedDept" @success="refetch" />
</template>

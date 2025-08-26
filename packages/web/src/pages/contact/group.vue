<script setup lang="ts">
import type { GroupGetallModel } from 'generated/mock/weila'
import type { GroupModel } from '~/api/contact'
import { ref as deepRef, shallowRef } from 'vue'

import CreateGroupModal from './components/CreateGroupModal.vue'
import DeleteGroupModal from './components/DeleteGroupModal.vue'
import EditGroupModal from './components/EditGroupModal.vue'

definePage({
  meta: {
    name: '群组管理',
  },
})

const { t } = useI18n()

const router = useRouter()

const curPage = shallowRef(1)
const pageSize = shallowRef(10)

const { data, refetch } = useWeilaFetch(() => `corp/group/get-group-list?page=${curPage.value}&size=${pageSize.value}`)

const selectedGroup = deepRef<GroupGetallModel['data']['groups'][number] | undefined>(undefined)

const checkedGroupIds = deepRef<number[]>([])

$inspect(checkedGroupIds)

function onSelect(group: GroupModel, e: PointerEvent) {
  selectedGroup.value = group
  // @ts-expect-error type error
  if (!e.target?.className?.includes('arco-table')) {
    return void 0
  }

  router.push(`/contact/group-${group.id}-${group.name}`)
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
          <CreateGroupModal @success="refetch" />
        </a-space>
      </template>

      <!-- @vue-expect-error type error when arco's row-click -->
      <a-table
        :pagination="{
          pageSize: 10,
          total: data?.count || 0,
        }"
        :data="data?.groups" size="medium" :column-resizable="true" :scroll="{
          x: 1000,
          y: 600,
        }" :scrollbar="true" @row-click="(...args) => onSelect(...args)"

        @page-change="(page) => curPage = page"
      >
        <template #columns>
          <a-table-column :title="t('avatar')">
            <template #cell="{ record: { avatar } }">
              <a-avatar :image-url="avatar?.replace(/^https?:/, '')">
                <IconUser />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column :title="t('name')">
            <template #cell="{ record: { name } }">
              {{ name }}
            </template>
          </a-table-column>
          <a-table-column :title="t('user-count')">
            <template #cell="{ record: { user_count } }">
              {{ user_count }}
            </template>
          </a-table-column>
          <a-table-column :title="t('burst-mode')">
            <template #cell="{ record: { burst_mode } }">
              <a-tag>
                {{
                  {
                    0: t('burst-mode-0'),
                    1: t('burst-mode-1'),
                    2: t('burst-mode-2'),
                  }[burst_mode as number]
                }}
              </a-tag>
            </template>
          </a-table-column>
          <!-- <a-table-column :title="t('shutup')">
            <template #cell="{ record: { shutup } }">
              <a-tag :color="shutup === 0 ? 'orange' : 'green'">
                {{
                  {
                    0: t('shutup-disable'),
                    1: t('shutup-enable'),
                  }[shutup as number]
                }}
              </a-tag>
            </template>
          </a-table-column> -->
          <a-table-column :title="t('created')">
            <template #cell="{ record: { created } }">
              {{ new Date(created * 1000).toLocaleDateString() }}
            </template>
          </a-table-column>
          <a-table-column :title="t('controls')">
            <template #cell="{ record }">
              <div flex gap2>
                <EditGroupModal :group="selectedGroup" @success="refetch">
                  <a-button @click="() => selectedGroup = record">
                    {{ t('button.edit') }}
                  </a-button>
                </EditGroupModal>
                <DeleteGroupModal :group="record" @success="() => refetch()">
                  <a-button status="danger" @click="() => selectedGroup = record">
                    {{ t('button.delete') }}
                  </a-button>
                </DeleteGroupModal>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </a-page-header>
</template>

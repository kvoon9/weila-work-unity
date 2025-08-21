<script setup lang="ts">
import type { GroupMemberModel } from '~/api/contact'
import { shallowRef } from 'vue'
import { TrackType } from '~/api/contact'

import AddGroupMemberModal from './components/AddGroupMemberModal.vue'
import DeleteGroupMemberModal from './components/DeleteGroupMemberModal.vue'

const { t } = useI18n()
const route = useRoute('/contact/group-[group_id]-[group_name]')

const curPage = shallowRef(1)
const pageSize = shallowRef(10)

const { data, refetch } = useWeilaFetch(() => `corp/group/get-group-member-list?page=${curPage.value}&size=${pageSize.value}`, {
  body: () => ({
    group_id: Number(route.params.group_id),
  }),
})

const isEditModalVisible = shallowRef(false)
const selectedMember = shallowRef<GroupMemberModel | undefined>(undefined)

function onSelect(member: GroupMemberModel, e: PointerEvent) {
  // @ts-expect-error type error
  if (!e.target?.className?.includes('arco-table')) {
    return void 0
  }

  isEditModalVisible.value = true
}
</script>

<template>
  <a-page-header
    show-back
    title="群组管理"
    @back="$router.back"
  >
    <template #breadcrumb>
      <a-breadcrumb>
        <a-breadcrumb-item>群列表</a-breadcrumb-item>
        <a-breadcrumb-item>{{ route.params.group_name }}</a-breadcrumb-item>
      </a-breadcrumb>
    </template>
    <a-card>
      <template #title>
        <a-space>
          <AddGroupMemberModal :group-id="Number(route.params.group_id)" @success="refetch">
            <a-button>
              <i i-ph-plus inline-block /> {{ t('button.add-group-member') }}
            </a-button>
          </AddGroupMemberModal>
        </a-space>
      </template>

      <!-- @vue-expect-error type error when arco's row-click -->
      <a-table
        :columns="cols"
        :pagination="{
          pageSize: 10,
          total: data?.count || 0,
        }"
        :data="data?.members"
        size="medium" :column-resizable="true" :scroll="{
          x: 1000,
          y: 600,
        }" :scrollbar="true"
        @page-change="(page) => curPage = page" @row-click="(...args) => onSelect(...args)"
      >
        <template #columns>
          <!-- <a-table-column :title="t('type')">
            <template #cell="{ record: { type } }">
              <a-tag v-if="type === 255" color="orange">
                {{ t('member-type.host') }}
              </a-tag>
              <a-tag v-else>
                {{ t('member-type.member') }}
              </a-tag>
            </template>
          </a-table-column> -->
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
          <a-table-column :title="t('weila-number')">
            <template #cell="{ record: { user_num } }">
              {{ user_num }}
            </template>
          </a-table-column>
          <a-table-column :title="t('phone')">
            <template #cell="{ record: { phone } }">
              {{ phone }}
            </template>
          </a-table-column>
          <a-table-column :title="t('loc_share')">
            <template #cell="{ record: { loc_share } }">
              <a-tag v-if="loc_share" color="green">
                {{ t('open') }}
              </a-tag>
              <a-tag v-else color="gray">
                {{ t('close') }}
              </a-tag>
            </template>
          </a-table-column>
          <!-- <a-table-column title="TTS">
            <template #cell="{ record: { tts } }">
              <a-tag v-if="tts" color="green">
                {{ t('open') }}
              </a-tag>
              <a-tag v-else color="gray">
                {{ t('close') }}
              </a-tag>
            </template>
          </a-table-column> -->
          <a-table-column :title="t('track')">
            <template #cell="{ record: { track } }">
              <a-tag>
                <!-- @vue-expect-error type error -->
                {{ {
                  [TrackType.Close]: t('track-type.close'),
                  [TrackType.High]: t('track-type.high'),
                  [TrackType.Medium]: t('track-type.medium'),
                  [TrackType.Low]: t('track-type.low'),
                  [TrackType.Fast]: t('track-type.fast'),
                }[track] }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('controls')">
            <template #cell>
              <div flex gap2>
                <DeleteGroupMemberModal
                  :group-id="Number(route.params.group_id)" :member="selectedMember"
                  @success="refetch"
                >
                  <a-button status="danger">
                    {{ t('button.delete') }}
                  </a-button>
                </DeleteGroupMemberModal>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </a-page-header>
</template>

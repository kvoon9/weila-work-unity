<script setup lang="ts">
import type { GroupMemberModel } from '~/api/contact'
import { useQuery } from '@tanstack/vue-query'
import { shallowRef } from 'vue'
import { weilaApiUrl } from '~/api'
import { TrackType } from '~/api/contact'

import AddGroupMemberModal from './components/AddGroupMemberModal.vue'
import DeleteGroupMemberModal from './components/DeleteGroupMemberModal.vue'
import EditGroupMemberModal from './components/EditGroupMemberModal.vue'

const { data: corp } = storeToRefs(useCorpStore())
const { t } = useI18n()
const route = useRoute('/contact/group-[group_id]-[group_name]')

const { data: members, refetch } = useQuery<Array<GroupMemberModel>>({
  enabled: computed(() => Boolean(corp.value)),
  queryKey: [weilaApiUrl('/corp/web/group-member-getall'), route.params.group_id],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/group-member-getall'), {
    body: {
      group_id: route.params.group_id,
    },
  }).then(i => i.members),
})

$inspect(members)

const isEditModalVisible = shallowRef(false)
const selectedMember = shallowRef<GroupMemberModel | undefined>(undefined)

function onSelect(member: GroupMemberModel, e: PointerEvent) {
  const whitelistEl = ['.arco-switch', '.arco-btn']
  // @ts-expect-error type error: no closest attr
  if (whitelistEl.find(className => e.target?.closest(className))) {
    selectedMember.value = member
    return
  }

  isEditModalVisible.value = true
  // router.push(`/contact/member-${member.dept_id}-${member.user_id}`)
}
</script>

<template>
  <div w-full p4 space-y-4>
    <div w-full rounded p4 space-y-4 bg-base>
      <section space-x-2>
        <AddGroupMemberModal :group-id="Number(route.params.group_id)" @success="refetch">
          <a-button>
            <i i-ph-plus inline-block /> {{ t('button.add-group-member') }}
          </a-button>
        </AddGroupMemberModal>
      </section>
      <!-- @vue-expect-error type error when arco's row-click -->
      <a-table
        :columns="cols" :data="members" size="medium" :column-resizable="true" :scroll="{
          x: 1000,
          y: 600,
        }" :scrollbar="true" @row-click="(...args) => onSelect(...args)"
      >
        <template #columns>
          <a-table-column :title="t('type')">
            <template #cell="{ record: { type } }">
              <a-tag v-if="type === 255" color="orange">
                {{ t('member-type.host') }}
              </a-tag>
              <a-tag v-else>
                {{ t('member-type.member') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('avatar')">
            <template #cell="{ record: { avatar } }">
              <a-avatar :image-url="avatar?.replace(/^https?:/, '')" :style="{ backgroundColor: '#3370ff' }">
                <img alt="avatar" :src="avatar">
                <IconUser />
              </a-avatar>
            </template>
          </a-table-column>
          <a-table-column :title="t('weila-number')">
            <template #cell="{ record: { user_num } }">
              {{ user_num }}
            </template>
          </a-table-column>
          <a-table-column :title="t('name')">
            <template #cell="{ record: { name } }">
              {{ name }}
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
                }[track] }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('controls')">
            <template #cell>
              <div flex gap2>
                <EditGroupMemberModal

                  :group-id="Number(route.params.group_id)" :member="selectedMember"
                  @success="refetch"
                >
                  <a-button v-show="false">
                    {{ t('button.edit') }}
                  </a-button>
                </EditGroupMemberModal>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MemberGetallModel } from 'generated/mock/weila'
import { objectEntries } from '@antfu/utils'
import { shallowRef } from 'vue'
import { TrackType } from '~/api/contact'

import AddDeviceModal from './components/AddDeviceModal.vue'
import CreateMemberModal from './components/CreateMemberModal.vue'
import DeleteMemberModal from './components/DeleteMemberModal.vue'
import EditDeviceModal from './components/EditDeviceModal.vue'
import EditMemberModal from './components/EditMemberModal.vue'
import ResetPasswordModal from './components/ResetMemberPasswordModal.vue'

definePage({
  alias: 'member',
  meta: {
    name: '成员管理',
  },
})

const { t } = useI18n()
const { themeColor } = useAppStore()

const memberIdxTitleMap: Partial<Record<keyof MemberGetallModel['data']['members'][number], string>> = {
  name: 'name',
  sex: 'gender',
  avatar: 'avatar',
  phone: 'phone',
  tts: 'TTS',
  loc_share: 'loc_share',
  track: 'track',
  state: 'member.state',
  created: 'created',
  online: 'state.online',
  dept_name: 'dept.name',
}

const filterInput = shallowRef('')

const curPage = shallowRef(0)
const pageSize = shallowRef(10)

const { data, refetch } = useWeilaFetch<{
  count: number
  members: {
    user_id: number
    user_num: string
    job_num: string
    sex: number
    name: string
    avatar: string
    is_admin: number
    dept_id: number
    phone: string
    country_code: string
    state: number
    type: number
    tts: number
    loc_share: number
    track: number
    group_count: number
    created: number
  }[]
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

const { data: depts } = useWeilaFetch<{
  id: number
  name: string
  user_count: number
}[]>('corp/address/get-all-dept')

const cols = computed(() => {
  const first = members.value?.[0]
  if (!first)
    return []
  return objectEntries(memberIdxTitleMap).map(([dataIndex, title]) => ({ title, dataIndex }))
})

$inspect(cols)

const selectedMember = shallowRef<MemberGetallModel['data']['members'][number] | undefined>(undefined)

const isEditMemberModalVisible = shallowRef(false)
const isEditDeviceModalVisible = shallowRef(false)
const isResetPasswordModalVisible = shallowRef(false)
const isDeleteMemberModalVisible = shallowRef(false)

function onSelect(member: MemberGetallModel['data']['members'][number], _: PointerEvent) {
  selectedMember.value = member
}

const { mutateAsync: changeMemberState } = useWeilaMutation<{ state: 0 | 1 }, {
  user_id: number
  state: 0 | 1
}>('corp/address/change-member-state')

async function toggleMemberState(targetId: number, state: 0 | 1) {
  const newState = state ? 0 : 1
  return changeMemberState({
    user_id: targetId,
    state: newState,
  })
    // NOTE: arco switch need a boolean return
    .then(({ state }) => state === newState)
    .catch(() => false)
}
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
      <!-- @vue-expect-error type error when arco's row-click -->
      <a-table
        :columns="cols"
        :data="members"
        :pagination="{
          pageSize,
          total: data?.count || 0,
        }"
        :column-resizable="true"
        :scroll="{
          x: 700,
          y: 600,
        }"
        :scrollbar="true"
        @page-change="(page) => curPage = page"
        @row-click="(...args) => onSelect(...args)"
      >
        <template #columns>
          <a-table-column :title="t('member.state')" :width="90">
            <template #cell="{ record: { state, user_id } }">
              <a-switch
                :default-checked="Boolean(!state)" :checked-value="0" :unchecked-value="1"
                :checked-color="themeColor" unchecked-color="#ddd" :before-change="(state) => toggleMemberState(
                  user_id,
                  Number(state) ? 0 : 1,
                )"
              >
                <template #checked>
                  {{ t('member-state.enabled') }}
                </template>
                <template #unchecked>
                  {{ t('member-state.paused') }}
                </template>
              </a-switch>
            </template>
          </a-table-column>
          <a-table-column
            :title="t('type')" :filterable="{
              filters: [{
                text: t('user-type.member'),
                value: '0',
              }, {
                text: t('user-type.device'),
                value: '1',
              }, {
                text: t('user-type.owner'),
                value: '2',
              }],
              filter: (value: any, record: any) => Number(record.type) === Number(value),
              multiple: false,
            }" :width="80"
          >
            <template #cell="{ record: { type } }">
              {{ {
                0: t('user-type.member'),
                1: t('user-type.device'),
                255: t('user-type.owner'),
              }[Number(type)] }}
            </template>
          </a-table-column>
          <a-table-column :title="t('state.online')" :width="70">
            <template #cell="{ record: { online } }">
              {{ online ? t('online') : t('offline') }}
            </template>
          </a-table-column>
          <a-table-column :title="t('avatar')" :width="70">
            <template #cell="{ record: { avatar } }">
              <a-avatar :image-url="avatar" :style="{ backgroundColor: '#3370ff' }" />
            </template>
          </a-table-column>
          <a-table-column :title="t('name')" :width="140">
            <template #cell="{ record: { name } }">
              {{ name }}
            </template>
          </a-table-column>
          <a-table-column :title="t('weila-number')" :width="100">
            <template #cell="{ record: { user_num } }">
              {{ user_num }}
            </template>
          </a-table-column>
          <a-table-column :title="t('job-number')" :width="100">
            <template #cell="{ record: { job_num } }">
              {{ job_num }}
            </template>
          </a-table-column>
          <a-table-column
            :title="t('dept.name')" :width="100" data-index="dept_id"
          >
            <template #cell="{ record: { dept_id } }">
              {{ depts?.find(d => d.id === dept_id)?.name || '' }}
            </template>
          </a-table-column>
          <a-table-column :title="t('created')" :width="120">
            <template #cell="{ record: { created } }">
              {{ new Date(created * 1000).toLocaleDateString() }}
            </template>
          </a-table-column>
          <a-table-column :title="t('phone')" :width="130">
            <template #cell="{ record: { phone } }">
              {{ phone }}
            </template>
          </a-table-column>
          <!-- <a-table-column :title="t('TTS')" :width="60">
            <template #cell="{ record: { tts } }">
              <a-tag v-if="tts" color="green">
                {{ t('open') }}
              </a-tag>
              <a-tag v-else color="gray">
                {{ t('close') }}
              </a-tag>
            </template>
          </a-table-column> -->
          <a-table-column :title="t('track')" :width="60">
            <template #cell="{ record: { track } }">
              <a-tag>
                <!-- @vue-expect-error type error -->

                {{
                  {
                    [TrackType.Close]: t('track-type.close'),
                    [TrackType.High]: t('track-type.high'),
                    [TrackType.Medium]: t('track-type.medium'),
                    [TrackType.Low]: t('track-type.low'),
                  }[track] }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('loc_share')" :width="100">
            <template #cell="{ record: { loc_share } }">
              <a-tag v-if="loc_share" color="green">
                {{ t('open') }}
              </a-tag>
              <a-tag v-else color="gray">
                {{ t('close') }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('controls')">
            <template #cell="{ record: { type } }">
              <div flex gap2>
                <a-dropdown :popup-max-height="false">
                  <a-button>{{ t('controls') }}<icon-down /></a-button>
                  <template #content>
                    <a-doption
                      @click="type === 1
                        ? isEditDeviceModalVisible = true
                        : isEditMemberModalVisible = true"
                    >
                      {{ t('button.edit') }}
                    </a-doption>
                    <a-doption v-if="type !== 1" @click="isResetPasswordModalVisible = true">
                      {{ t('reset-password.button') }}
                    </a-doption>
                    <a-doption @click="isDeleteMemberModalVisible = true">
                      {{ t('button.delete') }}
                    </a-doption>
                  </template>
                </a-dropdown>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>

  <EditMemberModal v-model:open="isEditMemberModalVisible" :member="selectedMember" @success="refetch" />
  <EditDeviceModal v-model:open="isEditDeviceModalVisible" :member="selectedMember" @success="refetch" />
  <ResetPasswordModal v-model:open="isResetPasswordModalVisible" :member="selectedMember" />
  <DeleteMemberModal v-model:open="isDeleteMemberModalVisible" :member="selectedMember" @success="refetch" />
</template>

<script setup lang="ts">
import type { MemberGetallModel } from 'generated/mock/weila'
import { objectEntries } from '@antfu/utils'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'
import { TrackType } from '~/api/contact'
import { weilaFetch } from '~/api/instances/fetcher'
import { weilaRequest } from '~/api/instances/request'
import AddDeviceModal from './components/AddDeviceModal.vue'
import CreateMemberModal from './components/CreateMemberModal.vue'
import DeleteMemberModal from './components/DeleteMemberModal.vue'
import EditDeviceModal from './components/EditDeviceModal.vue'
import EditMemberModal from './components/EditMemberModal.vue'
import ResetPasswordModal from './components/ResetMemberPasswordModal.vue'

definePage({
  alias: 'member',
})

const { data: corp, org_num } = storeToRefs(useCorpStore())
const { t } = useI18n()
const { themeColor } = useAppStore()
const route = useRoute('/contact/member-[[dept_id]]-[[dept_name]]')

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

const url = computed(() => {
  return route.params.dept_id
    ? weilaApiUrl('/corp/web/dept-member-getall')
    : weilaApiUrl('/corp/web/member-getall')
})

const filterInput = ref('')

const { data: _members, refetch } = useQuery({
  enabled: computed(() => Boolean(corp.value)),
  queryKey: [url, corp, route.params.dept_id],
  queryFn: () => weilaFetch<MemberGetallModel['data']>(url.value, {
    body: {
      org_num: corp.value!.num,
      dept_id: route.params.dept_id,
    },
  }).then(i => i.members.sort((a, b) => {
    return a.dept_id - b.dept_id
  }),
  ),
})

const members = computed(() => {
  if (!_members.value)
    return []

  if (!filterInput.value)
    return _members.value

  const searchTerm = filterInput.value.toLowerCase()

  return _members.value.filter(member =>
    member.name.toLowerCase().includes(searchTerm)
    || member.phone.toLowerCase().includes(searchTerm)
    || member.user_num.toLowerCase().includes(searchTerm)
    || member.job_num.toLowerCase().includes(searchTerm),
  )
})

const { data: depts } = useQuery<Array<{ id: number, name: string }>>({
  enabled: computed(() => Boolean(org_num.value)),
  queryKey: [weilaApiUrl('/corp/web/dept-getall'), org_num],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/dept-getall'), {
    body: {
      org_num: org_num.value,
    },
  }).then(i => i.depts),
})

// const selectedDepts = ref('')

const cols = computed(() => {
  const first = members.value?.[0]
  if (!first)
    return []
  return objectEntries(memberIdxTitleMap).map(([dataIndex, title]) => ({ title, dataIndex }))
})

$inspect(cols)

const selectedMember = ref<MemberGetallModel['data']['members'][number] | undefined>(undefined)

const isEditMemberModalVisible = ref(false)
const isEditDeviceModalVisible = ref(false)
const isResetPasswordModalVisible = ref(false)
const isDeleteMemberModalVisible = ref(false)

function onSelect(member: MemberGetallModel['data']['members'][number], _: PointerEvent) {
  selectedMember.value = member
}

const { mutateAsync: changeMemberState } = useMutation({
  mutationFn: (payload: { member_id: number, state: 0 | 1 }) => weilaRequest.post(weilaApiUrl('/corp/web/member-change-state'), {
    org_num: corp.value!.num,
    ...payload,
  }),
})

function toggleMemberState(targetId: number, state: 0 | 1) {
  const newState = state ? 0 : 1
  return changeMemberState({
    member_id: targetId,
    state: newState,
  })
    // NOTE: arco switch need a boolean return
    .then(({ data }) => data.state === newState)
    .catch(() => false)
}
</script>

<template>
  <div w-full p4 space-y-4>
    <a-breadcrumb>
      <RouterLink to="/contact/member">
        <a-breadcrumb-item>{{ t('submenu.member-manage') }}</a-breadcrumb-item>
      </RouterLink>
      <a-breadcrumb-item v-if="route.params.dept_id">
        {{ route.params.dept_name }}
      </a-breadcrumb-item>
    </a-breadcrumb>
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
        :columns="cols" :data="members" :column-resizable="true" :scroll="{
          x: 700,
          y: 600,
        }" :scrollbar="true" @row-click="(...args) => onSelect(...args)"
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
              filter: (value, record) => Number(record.type) === Number(value),
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
            :title="t('dept.name')" :width="100" data-index="dept_name" :filterable="{
              filters: depts?.map((dept) => ({
                text: dept.name,
                value: String(dept.id),
              })) || [],
              filter: (value, record) => Number(record.dept_id) === Number(value),
              multiple: false,
            }"
          >
            <template #cell="{ record: { dept_name } }">
              {{ dept_name }}
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
          <a-table-column :title="t('TTS')" :width="60">
            <template #cell="{ record: { tts } }">
              <a-tag v-if="tts" color="green">
                {{ t('open') }}
              </a-tag>
              <a-tag v-else color="gray">
                {{ t('close') }}
              </a-tag>
            </template>
          </a-table-column>
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

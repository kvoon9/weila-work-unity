<script setup lang="ts">
import type { Member } from '~/types/api'
import { shallowRef } from 'vue'
import { TrackType } from '~/api/contact'

defineProps<{
  members: Member[]
  count: number
}>()

const { t } = useI18n()
const { themeColor } = useAppStore()

const selected = shallowRef<Member | undefined>(undefined)
function onSelect(member: Member, _: PointerEvent) {
  selected.value = member
}

const { data: depts } = useWeilaFetch<{
  id: number
  name: string
  user_count: number
}[]>('corp/address/get-all-dept')

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
  <div>
    <!-- @vue-expect-error type error when arco's row-click -->
    <a-table
      :columns="cols"
      :data="members"
      :pagination="{
        pageSize: 10,
        total: count || 0,
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

        <a-table-column title="管理员" :width="80">
          <template #cell="{ record: { is_admin } }">
            <a-tag v-if="is_admin" color="orange">
              管理员
            </a-tag>
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
        <a-table-column title="群数量" :width="80">
          <template #cell="{ record: { grp_cnt, grp_lmt } }">
            <a-tag :color="grp_cnt >= grp_lmt ? 'magenta' : 'gray'">
              {{ grp_cnt }} / {{ grp_lmt }}
            </a-tag>
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
                  [TrackType.Fast]: t('track-type.fast'),
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
          <template #cell="{ record }">
            <div flex gap2>
              <a-dropdown :popup-max-height="false">
                <a-button>{{ t('controls') }}<icon-down /></a-button>
                <template #content>
                  <slot name="actions" v-bind="{ record, selected }" />
                </template>
              </a-dropdown>
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>

    <slot name="bottom" v-bind="{ selected }" />
  </div>
</template>

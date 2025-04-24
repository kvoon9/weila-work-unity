<script setup lang="ts">
import { objectEntries } from '@antfu/utils'
import Message from '@arco-design/web-vue/es/message'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { UseImage } from '@vueuse/components'
import { TrackType } from '~/api/contact'

import AddMembersModal from './add-members-modal.vue'

const { groupId } = defineProps<{
  groupId: number
}>()

const { t } = useI18n()
const { themeColor } = useAppStore()

enum Sex {
  Male,
  Female,
}

interface Member {
  user_id: number
  user_num: string
  sex: Sex
  name: string
  avatar: string
}

const { data: members, refetch } = useQuery<Member[]>({
  queryKey: ['members', groupId],
  queryFn: () => weilaFetch('/corp/web/group-member-getall', {
    body: {
      group_id: groupId,
    },
  }).then(i => i.members),
})

interface ChangeMemberPayload {
  group_id: number
  member_id: number
  prority: number
  tts: number
  loc_share: number
  track: TrackType
}

const { mutate: changeMember } = useMutation({
  mutationFn: (payload: ChangeMemberPayload) => weilaRequest.post('/corp/web/group-member-change', payload),
  onSuccess: () => {
    Message.success('Member settings changed successfully')
    refetch()
  },
  onError: (error) => {
    Message.error(`Failed to change member settings: ${error.message}`)
  },
})

const TrackTypeNameMap = {
  [TrackType.Close]: t('track-type.close'),
  [TrackType.High]: t('track-type.high'),
  [TrackType.Medium]: t('track-type.medium'),
  [TrackType.Low]: t('track-type.low'),
  [TrackType.Keep]: t('track-type.keep'),
}

const trackOptions = objectEntries(TrackTypeNameMap)
  .map(([value, key]) => ({
    label: key,
    value,
  }))

const changeMemberModalVisible = ref(false)

let changeMemberForm = reactive<ChangeMemberPayload>({
  group_id: groupId,
  member_id: 0,
  prority: 0,
  tts: 0,
  loc_share: 0,
  track: TrackType.Close,
})
watch(changeMemberModalVisible, (visible) => {
  if (!visible)
    return

  changeMemberForm = reactive({
    group_id: groupId,
    member_id: 0,
    prority: 0,
    tts: 0,
    loc_share: 0,
    track: TrackType.Close,
  })
})

interface DeleteMemberPayload {
  group_id: number
  member_ids: number[]
}

const toDeleteMembers = ref<string[]>([])
$inspect(toDeleteMembers)

const deleteMemberForm = computed<DeleteMemberPayload>(() => ({
  group_id: groupId,
  member_ids: toDeleteMembers.value.map(i => Number(i)),
}))

const deleteMemberModalVisible = ref(false)
const { mutate: deleteMembers } = useMutation({
  mutationFn: (payload: DeleteMemberPayload) => {
    if (!payload.member_ids.length) {
      throw new Error('No members selected for deletion')
    }
    return weilaRequest.post('/corp/web/group-member-delete', payload)
  },
  onSuccess() {
    Message.success('Members deleted successfully')
    refetch()
  },
  onError(error) {
    Message.error(error.message)
  },
})

const addMemberModalVisible = ref(false)
</script>

<template>
  <div>
    <h2 text-lg leading-loose>
      {{ t('group.settings.members') }}
    </h2>
    <div v-if="members">
      <button
        v-for="member in members" :key="member.user_id" m2 inline-flex flex-col items-center justify-center gap2
        size-18 @click="changeMemberModalVisible = true"
      >
        <UseImage :src="member.avatar" :alt="member.name" rounded-lg bg-coolgray-200 op70 size-10 hover:op100>
          <template #loading>
            <i i-carbon-user-avatar-filled-alt rounded bg-gray-200 text-gray-400 size-10 />
          </template>
          <template #error>
            <i i-carbon-warning-alt rounded bg-gray-200 text-gray-400 size-10 />
          </template>
        </UseImage>
        <div>
          <span truncate>{{ member.name }}</span>
          <!-- <span>
            <IconMan v-if="member.sex === Sex.Male" color-blue />
            <IconWoman v-else color-pink />
          </span> -->
        </div>
      </button>
      <button m2 inline-flex flex-col items-center justify-center gap2 size-18 @click="addMemberModalVisible = true">
        <div rounded-lg bg-coolgray-200 op70 size-10 hover:op100>
          <i i-carbon-add inline-block color-black size-10 />
        </div>
        <span>{{ t('button.add') }}</span>
      </button>
      <button m2 inline-flex flex-col items-center justify-center gap2 size-18 @click="deleteMemberModalVisible = true">
        <div rounded-lg bg-coolgray-200 op70 size-10 hover:op100>
          <i i-carbon-subtract inline-block color-black size-10 />
        </div>
        <span>{{ t('button.remove') }}</span>
      </button>
    </div>
    <!-- TODO: use antd ui  -->
    <a-empty v-else />
  </div>

  <AddMembersModal v-model:visible="addMemberModalVisible" :group-id="groupId" />

  <a-modal
    v-model:visible="changeMemberModalVisible" :title="t('change-member-settings-form.title')"
    @before-ok="(done) => changeMember(changeMemberForm, { onSuccess: () => done(true) })"
  >
    <a-form :model="changeMemberForm" layout="vertical">
      <a-form-item label="Priority" :name="t('priority')">
        <a-input-number v-model="changeMemberForm.prority" :min="0" :max="100" class="w-full" />
      </a-form-item>
      <a-form-item label="TTS" name="tts">
        <a-switch
          v-model="changeMemberForm.tts" :checked-value="1" :unchecked-value="0" :checked-color="themeColor"
          unchecked-color="#ddd"
        />
      </a-form-item>
      <a-form-item label="Location Sharing" name="loc_share">
        <a-switch
          v-model="changeMemberForm.loc_share" :checked-value="1" :unchecked-value="0"
          :checked-color="themeColor" unchecked-color="#ddd"
        />
      </a-form-item>
      <a-form-item label="Track" name="track">
        <a-radio-group
          v-model="changeMemberForm.track" type="button" :default-value="String(changeMemberForm.track)"
          :options="trackOptions"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:visible="deleteMemberModalVisible" title="Confirm Deletion"
    @before-ok="(done) => deleteMembers(deleteMemberForm, { onSuccess: () => done(true), onError: () => done(false) })"
  >
    <!-- <p>Are you sure you want to delete ?</p>
    <p color-red>
      This action cannot be undone.
    </p> -->
    <a-transfer
      v-model:model-value="toDeleteMembers" :data="members?.map(i => ({
        value: String(i.user_id),
        label: i.name,
        disabled: false,
      }))" simple mx-auto
    />
  </a-modal>
</template>

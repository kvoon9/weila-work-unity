<script setup lang="ts">
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'
import { useQueryClient } from '@tanstack/vue-query'
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

// const isResetPasswordModalVisible = shallowRef(false)
const isDeleteMemberModalOpen = shallowRef(false)

const qc = useQueryClient()
const { mutate } = useWeilaMutation<never, {
  dept_id: number
  user_id: number
}>('corp/address/delete-dept-member', {
  onSuccess() {
    isDeleteMemberModalOpen.value = false
    qc.invalidateQueries({ queryKey: ['corp/address/get-dept-member-list'] })
    Message.success(t('message.success'))
  },
})
</script>

<template>
  <a-page-header
    title="部门管理"
    @back="$router.back"
  >
    <template #breadcrumb>
      <a-breadcrumb>
        <a-breadcrumb-item>部门列表</a-breadcrumb-item>
        <a-breadcrumb-item>{{ route.params.dept_name }}</a-breadcrumb-item>
      </a-breadcrumb>
    </template>
    <a-card>
      <template #title>
        <a-space>
          <AddDeptMemberModal :dept-id="Number(route.params.dept_id)" @success="refetch">
            <a-button type="primary">
              <i i-ph-plus inline-block /> 添加成员
            </a-button>
          </AddDeptMemberModal>
          <a-input
            v-model="filterInput" :max-length="20" show-word-limit
            :placeholder="`${t('name')}/${t('job-number')}/${t('weila-number')}/${t('phone-number')}`" allow-clear
            max-w-80
          />
        </a-space>
      </template>

      <MemberTable v-model:page="curPage" :actions="!!Number(route.params.dept_id)" :members :count="data?.count || 0">
        <template #actions="{ selected }">
          <a-space>
            <EditMemberModal :member="selected" />
            <ModalTrigger :trigger="{ status: 'danger' }" :title=" t('button.delete') ">
              <template #content>
                {{ t('delete.modal.hint') }} {{ t('delete.modal.content') }}
              </template>
              <template #footer>
                <a-button
                  type="primary" @click="mutate({
                    dept_id: Number(route.params.dept_id),
                    user_id: selected!.user_id,
                  })"
                >
                  {{ t('button.submit') }}
                </a-button>
              </template>
            </ModalTrigger>
          </a-space>
        </template>
      </MemberTable>
    </a-card>
  </a-page-header>
</template>

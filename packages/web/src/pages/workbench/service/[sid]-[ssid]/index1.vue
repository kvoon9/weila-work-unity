<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { useRouteParams } from '@vueuse/router'
import { delBusinessPoint, useBusinessPointList } from '@weila/network'
import CreateBusinessPointModal from '../components/CreateBusinessPointModal.vue'

// 定义服务点类型接口
interface ServicePointModel {
  id: number
  name: string
  address?: string
  phone?: string
  avatar?: string
  [key: string]: any
}

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
const ssid = useRouteParams('ssid', 0, { transform: Number })

const { data, refetch } = useBusinessPointList($v2, computed(() => ({ sid: sid.value })))

// 用于编辑和删除服务点的状态管理
const isEditServicePointModalVisible = shallowRef(false)

const selectedServicePoint = ref<ServicePointModel | undefined>(undefined)

function openEdit(servicePoint: ServicePointModel) {
  selectedServicePoint.value = servicePoint
  isEditServicePointModalVisible.value = true
}

const isDelModalVisible = shallowRef(false)
const { mutateAsync: del, isPending: isDelPending } = delBusinessPoint($v2, {
  onSuccess() {
    Message.success('删除成功')
    refetch()
    isDelModalVisible.value = false
  },
})
</script>

<template>
  <div w-full p4 space-y-4>
    <a-breadcrumb>
      <RouterLink to="/workbench">
        <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
      </RouterLink>
      <a-breadcrumb-item>服务号</a-breadcrumb-item>
    </a-breadcrumb>

    <div w-full rounded p4 space-y-4 bg-base>
      <section space-x-2>
        <CreateBusinessPointModal :sid="sid">
          <a-button type="primary">
            {{ '创建服务点' }}
          </a-button>
        </CreateBusinessPointModal>
      </section>

      <a-table
        :data="data?.points"
        size="medium"
        :column-resizable="true"
        :scroll="{
          x: 1000,
          y: 600,
        }"
        :scrollbar="true"
        :columns="[{ title: '头像', dataIndex: 'avatar' }]"
      >
        <template #columns>
          <a-table-column title="头像" :width="80">
            <template #cell="{ record }">
              <div class="flex items-center justify-center">
                <a-avatar v-if="record.avatar" :image-url="record.avatar" :size="40" />
                <a-avatar v-else :size="40">
                  {{ record.name?.[0] || '未知' }}
                </a-avatar>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="名称" data-index="name">
            <template #cell="{ record }">
              {{ record.name }}
            </template>
          </a-table-column>
          <a-table-column title="地址">
            <template #cell="{ record }">
              {{ record.address || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="电话">
            <template #cell="{ record }">
              {{ record.phone || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="操作">
            <template #cell="{ record }">
              <div v-if="record.id" flex gap2>
                <a-button @click="() => openEdit(record)">
                  {{ t('button.edit') || '编辑' }}
                </a-button>
                <a-button
                  v-is-loading="isDelPending" status="danger" @click="() => {
                    isDelModalVisible = true
                    selectedServicePoint = record
                  }"
                >
                  {{ t('button.delete') || '删除' }}
                </a-button>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>

  <TheModal v-model:open="isDelModalVisible" title="删除服务点">
    <template #content>
      <p>
        确定删除该服务点吗？
      </p>
    </template>
    <template #footer>
      <a-button type="primary" @click="() => del({ pid: selectedServicePoint!.id })">
        确定
      </a-button>
    </template>
  </TheModal>

  <EditServicePointModal v-model:open="isEditServicePointModalVisible" :service-point="selectedServicePoint" @success="refetch" />
</template>

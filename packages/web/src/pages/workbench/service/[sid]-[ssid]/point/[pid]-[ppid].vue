<script setup lang="ts">
import { useRouteParams } from '@vueuse/router'
import { useGetBusinessPointStaffList } from '@weila/network'

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
const ssid = useRouteParams('ssid', 0, { transform: Number })
const pid = useRouteParams('pid', 0, { transform: Number })

const { data } = useGetBusinessPointStaffList($v2, { pid: pid.value })
</script>

<template>
  <div p4 space-y-4>
    <div>
      <a-breadcrumb>
        <RouterLink to="/workbench">
          <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
        </RouterLink>
        <RouterLink :to="`/workbench/service/${sid}-${ssid}/point`">
          <a-breadcrumb-item>服务点管理</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>服务点客服管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div rounded p4 space-y-2 bg-base>
      <div space-x-2>
        <TheModal title="创建客服">
          <a-button type="primary">
            创建客服
          </a-button>
          <template #content>
            <div>
              create
            </div>
          </template>
        </TheModal>
      </div>

      <div>
        <div v-for="staff in data" :key="staff.uid" relative cursor-pointer p4 hover:bg-neutral-100:20>
          {{ staff.name }}

          <div absolute position-y-center right-4>
            <a-button type="secondary" size="small">
              编辑
            </a-button>
            <a-button type="secondary" size="small">
              删除
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

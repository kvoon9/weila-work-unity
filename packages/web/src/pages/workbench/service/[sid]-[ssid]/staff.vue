<script setup lang="ts">
import { useRouteParams } from '@vueuse/router';

const { t } = useI18n()

const sid = useRouteParams('sid', 0, { transform: Number })
const ssid = useRouteParams('ssid', 0, { transform: Number })
</script>

<template>
  <div>
    <div p4>
      <a-breadcrumb>
        <RouterLink to="/workbench">
          <a-breadcrumb-item>{{ t('menu.workbench') }}</a-breadcrumb-item>
        </RouterLink>
        <RouterLink :to="`/workbench/service/${sid}-${ssid}`">
          <a-breadcrumb-item>服务号</a-breadcrumb-item>
        </RouterLink>
        <a-breadcrumb-item>服务号客服</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <div p4 bg-base rounded>
      123
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useToggleLocales } from '~/composables/useToggleLocales'

const { t } = useI18n()
const { toggle: toggleLocales } = useToggleLocales()
</script>

<template>
  <a-layout-footer flex="~ col center" p4 gap2 text-center>
    <p>
      <a-tooltip :content="t('settings.language')">
        <a-button class="nav-btn" type="outline" shape="circle" @click="toggleLocales">
          <template #icon>
            <icon-language />
          </template>
        </a-button>
      </a-tooltip>
    </p>
    <p>
      <span m0 border-0 p0 text-center text-12px class="ff">Copyright © 2025-2026 Voistech All Rights
        Reserved.&nbsp;</span>
      <span m0 border-0 p0 text-center text-12px class="ff">
        <a href="http://beian.miit.gov.cn">粤ICP备05000494号</a>
      </span>
    </p>
    <a href="https://szcert.ebs.org.cn/f304db7f-36b3-427e-88fe-9ae1ab58a192">
      <img size-8 src="https://szcert.ebs.org.cn/Images/govIcon.gif" title="深圳市市场监督管理局企业主体身份公示" alt="深圳市市场监督管理局企业主体身份公示">
    </a>
  </a-layout-footer>
</template>

<style scoped>
.ff {
  font-family:
    Microsoft YaHei,
    微软雅黑,
    Arial,
    Helvetica Neue,
    Helvetica,
    Arial,
    sans-serif;
}
</style>

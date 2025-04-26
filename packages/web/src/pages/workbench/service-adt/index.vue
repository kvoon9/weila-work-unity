<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { adtStateMap, useAuditLegal, useGetLegalList } from '@weila/network'
import Viewer from 'viewerjs'
import { shallowRef } from 'vue'

// 获取待审核的认证信息列表
const { data, refetch } = useGetLegalList($v2, { state: 0 })
const loading = shallowRef(false)
const rejectReason = shallowRef('')
const showRejectDialog = shallowRef(false)
const currentLegalId = shallowRef<number | null>(null)

// 类型映射
interface TypeMap {
  [key: number]: string
}

const typeMap: TypeMap = {
  1: '个体工商户',
  2: '企业',
  3: '个人',
}

// 审核操作
const { mutate: auditLegal, isPending: isAuditing } = useAuditLegal($v2, {
  onSuccess: () => {
    refetch()
    rejectReason.value = ''
    showRejectDialog.value = false
    currentLegalId.value = null
    Message.success('审核操作成功')
  },
})

// 通过审核
function handleApprove(id: number) {
  auditLegal({ id, state: 8 })
}

// 准备拒绝审核
function prepareReject(id: number) {
  currentLegalId.value = id
  showRejectDialog.value = true
}

// 确认拒绝审核
function confirmReject() {
  if (currentLegalId.value !== null) {
    auditLegal({
      id: currentLegalId.value,
      state: 9,
      reason: rejectReason.value,
    })
  }
}

// 图片预览
let viewer: Viewer | null = null
function handlePreview(e: MouseEvent) {
  if (e.target) {
    viewer?.destroy()
    viewer = new Viewer(e.target as HTMLElement, {
      inline: false,
    })
    viewer.show()
  }
}
</script>

<template>
  <div p4 space-y-4>
    <a-breadcrumb>
      <RouterLink to="/workbench">
        <a-breadcrumb-item>工作台</a-breadcrumb-item>
      </RouterLink>
      <a-breadcrumb-item>服务号审核</a-breadcrumb-item>
    </a-breadcrumb>

    <div p4 bg-base>
      <div my4 text-2xl leading-loose>
        服务号审核
      </div>

      <div v-if="loading" m12 space-y-4>
        <div i-svg-spinners-90-ring mxa text-4xl />
        <div text-center>
          加载中...
        </div>
      </div>

      <div v-else-if="!data?.legals || data.legals.length === 0" m12 space-y-4>
        <div i-carbon-folder mxa text-4xl />
        <div text-center>
          暂无待审核的认证信息
        </div>
      </div>

      <!-- 数据列表 - 响应式多列布局 -->
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
        <div
          v-for="legal in data.legals" :key="legal.id"
          border-l-4 rounded bg-neutral-100 p4 dark:bg-neutral-900
          :class="{ 'border-blue-400': legal.state === 0, 'border-green-400': legal.state === 8, 'border-red-400': legal.state === 9 }"
        >
          <div class="mb-4 flex items-center justify-between">
            <span class="font-medium">ID: {{ legal.id }}</span>
            <span
              class="rounded-full px-2 py-1 text-sm"
              :class="{ 'bg-blue-100 text-blue-800': legal.state === 0, 'bg-green-100 text-green-800': legal.state === 8, 'bg-red-100 text-red-800': legal.state === 9 }"
            >
              {{ adtStateMap[legal.state] || legal.state }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2 text-sm">
            <div class="flex justify-between border-b border-neutral-200 pb-2 dark:border-neutral-700">
              <span class="text-neutral-500">类别</span>
              <span>{{ legal.category }}</span>
            </div>

            <div class="flex justify-between border-b border-neutral-200 pb-2 dark:border-neutral-700">
              <span class="text-neutral-500">类型</span>
              <span>{{ typeMap[legal.type] || legal.type }}</span>
            </div>

            <div class="flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-700">
              <span class="text-neutral-500">营业执照</span>
              <img h-24 w-24 object-cover :src="legal.merchant.business_license" alt="license" @click="handlePreview">
            </div>

            <!-- 审核操作栏 -->
            <div v-if="legal.state === 0" class="flex justify-end pt-4 space-x-2">
              <a-button
                type="primary"
                status="success"
                :disabled="isAuditing"
                @click="handleApprove(legal.id)"
              >
                通过
              </a-button>
              <a-button
                type="primary"
                status="danger"
                :disabled="isAuditing"
                @click="prepareReject(legal.id)"
              >
                拒绝
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝理由对话框 -->
    <a-modal
      v-model:visible="showRejectDialog"
      title="请输入拒绝理由"
      :ok-loading="isAuditing"
      ok-text="确认拒绝"
      :ok-button-props="{ status: 'danger' }"
      @ok="confirmReject"
    >
      <a-textarea
        v-model="rejectReason"
        placeholder="请输入拒绝理由..."
        :auto-size="{ minRows: 4, maxRows: 6 }"
      />
    </a-modal>
  </div>
</template>

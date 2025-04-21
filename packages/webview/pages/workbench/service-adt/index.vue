<script setup lang="ts">
import Viewer from 'viewerjs'
import { shallowRef } from 'vue'

definePageMeta({
  layout: 'back',
})

appHead.value = '审核认证信息'

const { data, refetch } = useGetLegalList({ state: 0 })
const loading = shallowRef(false)
const rejectReason = shallowRef('')
const showRejectDialog = shallowRef(false)
const currentLegalId = shallowRef<number | null>(null)

interface TypeMap {
  [key: number]: string
}

const typeMap: TypeMap = {
  1: '个体工商户',
  2: '企业',
  3: '个人',
}

// 使用 useAuditLegal 设置审核操作
const { mutate: auditLegal, isPending: isAuditing } = useAuditLegal({
  onSuccess: () => {
    // 审核成功后刷新列表
    refetch()
    // 重置拒绝理由和对话框
    rejectReason.value = ''
    showRejectDialog.value = false
    currentLegalId.value = null
  },
})

// 处理通过审核
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
  <div class="px-4 py-6">
    <!-- <h1 class="text-xl font-bold mb-4">
      认证信息列表
    </h1> -->

    <div v-if="loading" class="text-center py-10 text-gray-500">
      <div class="i-carbon-circle-dash animate-spin inline-block text-2xl mb-2" />
      <div>加载中...</div>
    </div>

    <div v-else-if="!data?.legals || data.legals.length === 0" class="text-center py-10 text-gray-400">
      <div class="i-carbon-folder text-4xl mb-2 opacity-50" />
      <div>暂无数据</div>
    </div>

    <div v-else id="root" class="space-y-3">
      <div
        v-for="legal in data.legals" :key="legal.id"
        class="bg-white rounded-lg shadow p-4 border-l-4"
        :class="{ 'border-blue-400': legal.state === 0, 'border-green-400': legal.state === 8, 'border-red-400': legal.state === 9 }"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium">ID: {{ legal.id }}</span>
          <span
            class="text-sm px-2 py-1 rounded-full"
            :class="{ 'bg-blue-100 text-blue-800': legal.state === 0, 'bg-green-100 text-green-800': legal.state === 8, 'bg-red-100 text-red-800': legal.state === 9 }"
          >
            {{ adtStateMap[legal.state] || legal.state }}
          </span>
        </div>

        <div class="grid grid-cols-1 gap-2 text-sm text-gray-600">
          <div class="flex justify-between border-b border-gray-100 pb-1">
            <span class="text-gray-500">类别</span>
            <span>{{ legal.category }}</span>
          </div>

          <div class="flex justify-between border-b border-gray-100 pb-1">
            <span class="text-gray-500">类型</span>
            <span>{{ typeMap[legal.type] || legal.type }}</span>
          </div>

          <div class="flex justify-between items-center border-b border-gray-100 pb-1">
            <span class="text-gray-500">营业执照</span>
            <img class="business_license" :src="legal.merchant.business_license" alt="license" size-24 @click="handlePreview">
          </div>

          <!-- 审核操作栏 -->
          <div v-if="legal.state === 0" class="flex justify-end space-x-2 pt-2">
            <button
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              :disabled="isAuditing"
              @click="handleApprove(legal.id)"
            >
              通过
            </button>
            <button
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              :disabled="isAuditing"
              @click="prepareReject(legal.id)"
            >
              拒绝
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 拒绝理由对话框 -->
    <div v-if="showRejectDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-5 max-w-md w-full m4">
        <h3 class="text-lg font-medium mb-3">
          请输入拒绝理由
        </h3>
        <textarea
          v-model="rejectReason"
          class="w-full border rounded p-2 mb-4 h-24"
          placeholder="请输入拒绝理由..."
        />
        <div class="flex justify-end space-x-2">
          <button
            class="px-4 py-2 border rounded"
            @click="showRejectDialog = false"
          >
            取消
          </button>
          <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            :disabled="!rejectReason || isAuditing"
            @click="confirmReject"
          >
            确认拒绝
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

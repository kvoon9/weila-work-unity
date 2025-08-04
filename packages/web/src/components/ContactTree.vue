<script setup lang="ts">
import type { DeptGetallModel } from 'generated/mock/weila';
import type { Member } from '~/types/api';
import Message from '@arco-design/web-vue/es/message';
import { ref as deepRef } from 'vue';

const emits = defineEmits<{
  (e: 'select', selectedKeys: string[], data: { selected?: boolean, selectedNodes: TreeNodeData[], node?: TreeNodeData, e?: Event }): void
}>()

const { data: depts } = useWeilaFetch<DeptGetallModel['data']['depts']>('/corp/address/get-all-dept')

interface TreeNodeData {
  title: string
  key: string
  selectable?: boolean
  isLeaf?: boolean
  children?: TreeNodeData[]
}

const treeData = deepRef<TreeNodeData[]>([])

watchEffect(() => {
  treeData.value = depts.value?.map((dept) => {
    return {
      title: dept.name,
      key: `dept-${dept.id}`,
      selectable: false,
    }
  })
})

async function loadMore(nodeData: TreeNodeData) {
  const dept_id = Number(nodeData.key.replace('dept-', ''))
  const weilaApi = useWeilaApi()

  const members = await weilaApi.value.v2.fetch<Member[]>('corp/address/get-dept-all-member', {
    body: {
      dept_id,
    },
  })

  if (!members.length) {
    Message.warning('无数据')
    return
  }

  nodeData.children = members.map((member) => {
    return {
      key: `member-${member.user_id}`,
      title: member.name,
      isLeaf: true,
    }
  })
}
</script>

<template>
  <a-tree
    :data="treeData"
    :load-more="loadMore"
    @select="(arg1: any, arg2: any) => emits('select', arg1, arg2)"
  />
</template>

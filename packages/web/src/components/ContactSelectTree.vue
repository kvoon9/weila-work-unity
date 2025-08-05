<script setup lang="ts">
import type { DeptGetallModel } from 'generated/mock/weila'
import type { TreeNodeData } from '~/types'
import type { Member } from '~/types/api'
import Message from '@arco-design/web-vue/es/message'
import { ref as deepRef } from 'vue'

const props = withDefaults(defineProps<{
  uncheckableIds?: number[]
  isItemEnable?: (item: Member) => boolean
}>(), {
  uncheckableIds: () => [],
})

const { data: depts } = useWeilaFetch<DeptGetallModel['data']['depts']>('/corp/address/get-all-dept')

const treeData = deepRef<TreeNodeData[]>([])
watchEffect(() => {
  treeData.value = depts.value?.map((dept) => {
    return {
      title: dept.name,
      key: `dept-${dept.id}`,
      checkable: false,
    }
  })
})
const checkedKeys = defineModel<string[]>('checkedKeys', {
  required: false,
  default: [],
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
      title: `${member.name}`,
      isLeaf: true,
      selectable: !props.uncheckableIds.includes(member.user_id) && props.isItemEnable?.(member),
      checkable: !props.uncheckableIds.includes(member.user_id) && props.isItemEnable?.(member),
    }
  })

  if (nodeData.children.some(i => i.checkable))
    nodeData.checkable = true
}
</script>

<template>
  <a-tree
    v-model:checked-keys="checkedKeys"
    :data="treeData"
    :load-more="loadMore"
    checkable
  >
  </a-tree>
</template>

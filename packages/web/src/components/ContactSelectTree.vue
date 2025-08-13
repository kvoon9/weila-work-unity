<script setup lang="ts">
import type { DeptGetallModel } from 'generated/mock/weila'
import type { TreeNodeData } from '~/types'
import type { Member } from '~/types/api'
import IconUser from '@arco-design/web-vue/es/icon/icon-user'
import IconUserGroup from '@arco-design/web-vue/es/icon/icon-user-group'
import Message from '@arco-design/web-vue/es/message'
import { ref as deepRef } from 'vue'

const props = withDefaults(defineProps<{
  uncheckableIds?: number[]
  isItemEnable?: (item: Member) => boolean
}>(), {
  uncheckableIds: () => [],
})

const treeRef = useTemplateRef('treeRef')

const isVisible = useElementVisibility(treeRef)

const { data: depts } = useWeilaFetch<DeptGetallModel['data']['depts']>('/corp/address/get-all-dept')

const treeData = deepRef<TreeNodeData[]>([])
watchEffect(() => {
  treeData.value = depts.value?.map((dept) => {
    return {
      title: `${dept.name} (${dept.user_count})`,
      icon: () => h(IconUserGroup),
      key: `dept-${dept.id}`,
      checkable: true,
      disableCheckbox: !dept.user_count,
    }
  })
})
const checkedKeys = defineModel<string[]>('checkedKeys', {
  required: false,
  default: [],
})

watchEffect(() => isVisible.value && (checkedKeys.value = []))

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
      icon: () => h(IconUser),
      isLeaf: true,
      selectable: !props.uncheckableIds.includes(member.user_id) && props.isItemEnable?.(member),
      checkable: true,
      disableCheckbox: props.uncheckableIds.includes(member.user_id) && props.isItemEnable?.(member),
    }
  })

  if (nodeData.children.some(i => i.checkable)) {
    nodeData.disableCheckbox = false
  }
}
</script>

<template>
  <div>
    <a-tree
      ref="treeRef"
      v-model:checked-keys="checkedKeys"
      show-lines
      :data="treeData"
      :load-more="loadMore"
      checkable
      @check="(_: string[], data: {checked: boolean, node:TreeNodeData}) => {
        const { node, checked } = data
        if (checked && node.key.startsWith('dept') && !node.children?.length)
          loadMore(node)
      }"
    />
  </div>
</template>

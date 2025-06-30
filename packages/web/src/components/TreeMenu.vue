<script setup lang="ts">
const router = useRouter()

function goTo(path: string, _rest: string[] | undefined) {
  const isChild = _rest === undefined
  if (!isChild)
    return

  router.push(path)
}

const corpStore = useCorpStore()
const { data: corp } = storeToRefs(corpStore)
</script>

<template>
  <div>
    <a-menu
      :style="{ width: '200px', height: '100%' }"
      :default-open-keys="['contact']"
      :default-selected-keys="['/contact/org']"
      show-collapse-button
      @menu-item-click="goTo"
      @sub-menu-click="goTo"
    >
      <a-trigger v-if="corp" position="bl" auto-fit-position :unmount-on-close="false" :popup-translate="[5, 5]" trigger="click">
        <div cursor-pointer text-neutral-500 px4 py2 hover:bg-neutral-200:50 rounded border mb4 mt2 flex items-center justify-between>
          <div>
            <div font-bold>
              {{ corp.name }}
            </div>
            <div text-sm>
              {{ corp.num }}
            </div>
          </div>
          <IconRight />
        </div>
        <template #content>
          <div bg-white border p4 rounded-lg>
            升级套餐
          </div>
        </template>
      </a-trigger>
      <a-menu-item key="/contact/org">
        <template #icon>
          <IconHome />
        </template>
        主页
      </a-menu-item>
      <a-sub-menu key="contact">
        <template #icon>
          <IconApps />
        </template>
        <template #title>
          通讯录
        </template>
        <a-menu-item key="/contact/member">
          成员管理
        </a-menu-item>
        <a-menu-item key="/contact/dept">
          部门管理
        </a-menu-item>
        <a-menu-item key="/contact/group">
          群组管理
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

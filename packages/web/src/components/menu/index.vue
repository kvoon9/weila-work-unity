<!--
  NOTE: Arco 模板的 menu 主要针对二级菜单场景使用，对一级菜单的适配较差，而本项目此处只有一级菜单，故重写了该组件

  Arco 模板 一级菜单存在的问题(https://github.com/arco-design/arco-design-pro-vue/issues/85#issuecomment-1142289501):
    1. 无法重定向一级菜单，只实现了展开/折叠功能
    2. 根据 issue 内的解决方案配置菜单后，可以重定向，但是无法高亮显示

  本项目解决方案:
    1. 重写该组件，直接使用一级菜单
    2. 不再手动配置整个路由，配置菜单时，前往 `src/pages/**/*.vue` 页面进行菜单配置，默认不配置不会出现在菜单中

    ```vue
    <script setup>
    definePage({
      meta: {
        menu: {
          label: '菜单名称',
          icon: 'icon-name', // arco icon 组件名
          order: 1,
        },
      }
    })
    </script>
    ```
 -->

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import { isString } from '@antfu/utils'
import { routes } from 'vue-router/auto-routes'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

function* traverse(routes: RouteRecordRaw[]): Generator<RouteRecordRaw> {
  for (const route of routes) {
    if (route.children && route.children.length > 0) {
      yield* traverse(route.children)
    }

    yield route
  }
}

const menus = ref<{
  label: string
  path: string
  icon?: string
  order: number
}[]>([])

for (const route of traverse(routes)) {
  const { menu } = route.meta || {}
  // TODO: improve type
  const path = route.name as string

  if (menu) {
    const {
      order = 99,
    } = menu
    menus.value.push(
      isString(menu)
        ? { label: menu, path, icon: undefined, order }
        : { label: menu.label, path, icon: menu.icon, order },
    )

    menus.value.sort((a, b) => a.order - b.order)
  }
}

const defaultSelectedKeys = computed(() => {
  let key = ''

  const menu = menus.value.find(({ path }) => route.path.startsWith(path))

  if (menu)
    key = menu.path

  return [key]
})

const selectedKeys = ref<string[]>(defaultSelectedKeys.value)

function goto(path: string) {
  router.push(path)
}
</script>

<template>
  <a-menu
    v-model:selected-keys="selectedKeys"
    :default-selected-keys="defaultSelectedKeys"
    mode="pop"
  >
    <a-menu-item v-for="menu in menus" :key="menu.path" @click="() => goto(menu.path)">
      <template #icon>
        <component :is="menu.icon" v-if="menu.icon" />
      </template>
      {{ t(menu.label) }}
    </a-menu-item>
  </a-menu>
</template>

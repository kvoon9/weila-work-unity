<script setup lang="ts">
interface Nav {
  name: string
  path: string
  icon: string
  visible: boolean
}

const route = useRoute()

const { data: corp } = useCorp()

const hasCorp = computed(() => Boolean(corp.value))

const navs = computed<Nav[]>(() => [
  {
    name: '工作台',
    path: '/workbench',
    icon: 'ph:building-office',
    visible: hasCorp.value,
  },
  {
    name: '通讯录',
    path: '/contacts',
    icon: 'ph:users',
    visible: hasCorp.value,
  },
  {
    name: '我的',
    path: '/me',
    icon: 'ph:user',
    visible: true,
  },
])

const active = computed(() => navs.value.find(i => route.path.startsWith(i.path)))

defineExpose({
  active,
})
</script>

<template>
  <nav backdrop-blur-xl h20 border-t w-screen flex justify-around items-center>
    <NuxtLink
      v-for="nav in navs.filter(i => i.visible)"
      :key="nav.path"
      :replace="true"
      :to="nav.path"
      :class="{
        'text-primary': active?.path === nav.path,
      }"
      flex="~ col grow-1 justify-center items-center"
    >
      <Icon size-8 :name="nav.icon" mode="svg" />
      {{ nav.name }}
    </NuxtLink>
  </nav>
</template>

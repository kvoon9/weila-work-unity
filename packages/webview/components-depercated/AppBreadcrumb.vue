<script setup lang="ts">
import { NuxtLink } from '#components'
import { isFunction } from '@antfu/utils'

const route = useRoute()

const breadcrumb = computed(() => [
  ...(route.meta.breadcrumb || []),
  route.meta.name
    ? { name: route.meta.name }
    : undefined,
].filter(i => Boolean(i)))
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="i, key in breadcrumb" :key>
        <BreadcrumbItem v-if="key + 1 !== breadcrumb?.length">
          <BreadcrumbLink :href="i?.href || '#'" :as="i?.href ? NuxtLink : 'div'">
            {{ isFunction(i?.name) ? i?.name() : i?.name }}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="key + 1 < (breadcrumb?.length || 0)" />
      </template>
      <BreadcrumbItem>
        <BreadcrumbPage>{{ breadcrumb?.at(-1)?.name }}</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</template>

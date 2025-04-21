<script setup lang="ts">
const { data } = useCorp()
</script>

<template>
  <div>
    <div v-if="data" bg-white rounded-xl pt4 space-y-4 border of-hidden bg-neutral-200>
      <div flex space-x-2 relative mx4>
        <img
          :src="data?.avatar || '/default-avatar.png'" :alt="data?.name || 'Organization'"
          class="rounded object-cover size-12 "
        >
        <div>
          <h2 class="text-lg font-semibold">
            {{ data.name }}
          </h2>
          <p class="text-sm text-gray-500">
            创建日期：{{ data.created }}
          </p>
        </div>

        <div absolute right-0>
          <NuxtLink bg-white:75 px2 py1 rounded-lg to="/org/edit">
            编辑
          </NuxtLink>
        </div>
      </div>
      <div class="grid gap-4 rounded">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                群成员数
              </th>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                群组数
              </th>
              <th class="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                设备数
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ data.member_cnt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ data.group_cnt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ data.device_cnt }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else bg-neutral-100 border rounded-lg p-4 m2>
      <NuxtLink to="/org/create" flex="~ col space-y-2 justify-center items-center rounded-lg p-4 m2">
        <Icon
          name="ph:building-office"
          class="text-2xl"
        />
        创建企业
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Corp } from '~/types'
import type { Legal } from '~/types/api'
import { shallowRef } from 'vue'
import CreateCorpModal from './components/CreateCorpModal.vue'
import EditCorpModal from './components/EditCorpModal.vue'

definePage({
  alias: ['/'],
})

const { t } = useI18n()

const router = useRouter()

const { data: corp, isSuccess } = useWeilaFetch<Corp>('corp/org/get-my-org')

const { data } = useWeilaFetch<Legal>('corp/legal/get-legal')

const isEditCorpModalVisible = shallowRef(false)

watchEffect(() => {
  if (isSuccess.value && !corp.value)
    router.push('/create-org')
})
</script>

<template>
  <div p4>
    <a-empty v-if="!corp" />
    <div v-else w-full overflow-hidden rounded-lg duration-300 bg-base>
      <div border p-6>
        <header flex justify-between>
          <div flex>
            <img
              :src="corp.avatar || '/default-avatar.png'" :alt="corp?.name || 'Organization'"
              class="mr-4 rounded object-cover size-20"
            >
            <div space-y-4>
              <h1 dark:text-white flex gap-2>
                <div>
                  <div text-2xl font-semibold text-gray-800>
                    {{ corp.name || 'Organization' }}

                    <a-button type="secondary" size="mini" rounded @click="isEditCorpModalVisible = true">
                      <i i-ph-pen mr2 inline-block />
                      {{ t('button.edit') }}
                    </a-button>
                  </div>
                  <!-- <div color-neutral-6>
                    {{ corp.num }}
                  </div> -->
                </div>
              </h1>
              <div space-x-2>
                <a-tag v-if="data?.state === 8" color="orangered">
                  <template #icon>
                    <icon-check-circle-fill />
                  </template>
                  {{ data.category === 0 ? '企业' : '个人' }}认证
                </a-tag>
                <a-tag v-else-if="data?.state === 9">
                  认证未通过
                </a-tag>
                <a-tag v-else>
                  未认证
                </a-tag>

                <a-tag>
                  {{ corp.vip ? `VIP (${new Date(corp.vip_expired * 1000).toLocaleDateString()})` : '标准版' }}
                </a-tag>
              </div>
            </div>
          </div>
          <a-button type="primary" @click="$router.push('/contact/legal')">
            认证
          </a-button>
        </header>
      </div>
      <div grid="~ cols-3 gap-2" my4>
        <RouterLink to="/contact/member" border rounded-lg p4>
          <a-statistic title="成员数量 " :value="corp.member_cnt" show-group-separator />
        </RouterLink>
        <RouterLink to="/contact/group" border rounded-lg p4>
          <a-statistic title="群组数量" :value="corp.group_cnt" show-group-separator />
        </RouterLink>
        <RouterLink to="/contact/member" border rounded-lg p4>
          <a-statistic title="设备数量" :value="corp.device_cnt" show-group-separator />
        </RouterLink>
      </div>
    </div>
  </div>

  <CreateCorpModal />

  <EditCorpModal v-model:open="isEditCorpModalVisible" :avatar="corp?.avatar" :name="corp?.name" />
</template>

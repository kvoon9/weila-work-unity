<script setup lang="ts">
import type { VipInfo } from '~/stores/auth'
import type { Corp } from '~/types'
import type { Legal } from '~/types/api'
import EditCorpModal from './components/EditCorpModal.vue'

definePage({
  alias: ['/'],
})

const { t } = useI18n()

const router = useRouter()

const { data: corp, isSuccess } = useWeilaFetch<Corp>('corp/org/get-my-org')

const { data: vip } = useWeilaFetch<VipInfo>('corp/org/get-my-vip')

const { data } = useWeilaFetch<Legal>('corp/legal/get-legal')

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
            <a-image
              height="70"
              width="70"
              :src="corp.avatar || '/default-avatar.png'"
              class="mr-4 rounded object-cover size-20"
            />

            <div space-y-4>
              <h1 dark:text-white flex gap-2>
                <div>
                  <div text-2xl font-semibold text-gray-800 flex="~ items-center" gap2>
                    <span> {{ corp.name || 'Organization' }} </span>
                  </div>
                </div>
              </h1>
              <div space-x-2>
                <a-tag v-if="data?.state === 8" color="orangered">
                  <template #icon>
                    <icon-check-circle-fill />
                  </template>
                  {{ $t('adt', [data.category === 0 ? t('org.enterprise') : t('org.personal')]) }}
                </a-tag>
                <a-tag v-else-if="data?.state === 9">
                  {{ $t('org.auth-failed') }}
                </a-tag>
                <a-tag v-else>
                  {{ $t('org.unauth') }}
                </a-tag>
                <a-tag>
                  {{ vip?.vip_name }} <span v-if="vip?.vip">({{ new Date(corp.vip_expired * 1000).toLocaleDateString() }})</span>
                </a-tag>
              </div>
            </div>
          </div>

          <a-space>
            <EditCorpModal />
            <a-button type="primary" @click="$router.push('/contact/legal')">
              {{ $t('org.auth') }}
            </a-button>
          </a-space>
        </header>
      </div>
      <div grid="~ cols-4 gap-2" my4>
        <RouterLink to="/contact/member" border rounded-lg p4>
          <a-statistic :title="$t('member-count') " :value="corp.member_cnt" show-group-separator />
        </RouterLink>
        <RouterLink to="/contact/dept" border rounded-lg p4>
          <a-statistic :title="$t('dept-count') " :value="corp.dept_cnt" show-group-separator />
        </RouterLink>
        <RouterLink to="/contact/group" border rounded-lg p4>
          <a-statistic :title="$t('group-count')" :value="corp.group_cnt" show-group-separator />
        </RouterLink>
        <RouterLink to="/contact/member" border rounded-lg p4>
          <a-statistic :title="$t('device-count')" :value="corp.device_cnt" show-group-separator />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

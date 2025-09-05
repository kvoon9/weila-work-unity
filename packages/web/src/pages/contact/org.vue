<script setup lang="ts">
import type { Corp } from '~/types'
import EditCorpModal from './components/EditCorpModal.vue'

definePage({
  alias: ['/'],
})

const router = useRouter()

const { data: corp, isSuccess } = useWeilaFetch<Corp>('corp/org/get-my-org')

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
            </div>
          </div>

          <a-space>
            <EditCorpModal />
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

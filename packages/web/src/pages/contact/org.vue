<script setup lang="ts">
import EditCorpModal from './components/EditCorpModal.vue'

const { t } = useI18n()

const corpStore = useCorpStore()
const { refetch } = corpStore
const { data: corp } = storeToRefs(corpStore)

const isEditCorpModalVisible = ref(false)
</script>

<template>
  <div p4>
    <a-empty v-if="!corp" />
    <div v-else class="w-full overflow-hidden rounded-lg shadow-md transition-colors duration-300 bg-base">
      <div class="p-6">
        <header flex justify-between>
          <div flex>
            <img
              :src="corp?.avatar || '/default-avatar.png'" :alt="corp?.name || 'Organization'"
              class="mr-4 rounded object-cover size-20"
            >
            <div>
              <h1 class="mb-4 text-2xl text-gray-800 font-semibold dark:text-white">
                {{ corp?.name || 'Organization' }}
              </h1>
              <section class="flex flex-wrap gap-4">
                <dl class="flex items-center">
                  <dt class="sr-only">
                    {{ t('org.members') }}
                  </dt>
                  <dd class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                      />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-200">{{ corp?.member_cnt || 0 }} {{ t('org.members')
                    }}</span>
                  </dd>
                </dl>
                <dl class="flex items-center">
                  <dt class="sr-only">
                    {{ t('org.groups') }}
                  </dt>
                  <dd class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path d="M13 7H7v6h6V7z" />
                      <path
                        fill-rule="evenodd"
                        d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-200">{{ corp?.group_cnt || 0 }} {{ t('org.groups')
                    }}</span>
                  </dd>
                </dl>
                <dl class="flex items-center">
                  <dt class="sr-only">
                    {{ t('org.devices') }}
                  </dt>
                  <dd class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-200">{{ corp?.device_cnt || 0 }} {{ t('org.devices')
                    }}</span>
                  </dd>
                </dl>
                <dl class="flex items-center">
                  <dt class="sr-only">
                    {{ t('org.created-date') }}
                  </dt>
                  <dd class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                      viewBox="0 0 20 20" fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-gray-700 dark:text-gray-200">
                      {{ t('org.created-date') }}: {{
                        new Date(corp?.created * 1000 || 0).toLocaleDateString() || 'N/A'
                      }}</span>
                  </dd>
                </dl>
              </section>
              <!-- <p class="mb-4 text-gray-600 dark:text-gray-300">
                {{ corp?.intro || t('no-intro-data') }}
              </p> -->
            </div>
          </div>
          <a-button type="primary" rounded @click="isEditCorpModalVisible = true">
            <i i-ph-pen mr2 inline-block />
            {{ t('button.edit') }}
          </a-button>
        </header>
        <!-- <section class="flex flex-wrap gap-4">
          <dl class="flex items-center">
            <dt class="sr-only">
              {{ t('org.members') }}
            </dt>
            <dd class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span class="text-gray-700 dark:text-gray-200">{{ corp?.member_cnt || 0 }} {{ t('org.members') }}</span>
            </dd>
          </dl>
          <dl class="flex items-center">
            <dt class="sr-only">
              {{ t('org.groups') }}
            </dt>
            <dd class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 7H7v6h6V7z" />
                <path fill-rule="evenodd"
                  d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700 dark:text-gray-200">{{ corp?.group_cnt || 0 }} {{ t('org.groups') }}</span>
            </dd>
          </dl>
          <dl class="flex items-center">
            <dt class="sr-only">
              {{ t('org.devices') }}
            </dt>
            <dd class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700 dark:text-gray-200">{{ corp?.device_cnt || 0 }} {{ t('org.devices') }}</span>
            </dd>
          </dl>
          <dl class="flex items-center">
            <dt class="sr-only">
              {{ t('org.created-date') }}
            </dt>
            <dd class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-gray-700 dark:text-gray-200">
                {{ t('org.created-date') }}: {{
                  new Date(corp?.created * 1000 || 0).toLocaleDateString() || 'N/A'
                }}</span>
            </dd>
          </dl>
        </section> -->
      </div>
    </div>
  </div>

  <EditCorpModal v-model:open="isEditCorpModalVisible" :avatar="corp?.avatar" :name="corp?.name" @success="refetch" />
</template>

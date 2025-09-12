<script lang="ts" setup>
import type { SelfInfo } from '~/types'
import { useFullscreen } from '@vueuse/core'
import { computed, inject, shallowRef } from 'vue'
import { useBundleInfo } from '~/composables/useBundleInfo'
import { useToggleLocales } from '~/composables/useToggleLocales'
import { isDev } from '~/shared'
import { useAuthStore } from '~/stores/auth'
import { version } from '../../../package.json'
import BindingPhone from '../BindingPhone.vue'
import DeleteAccount from '../DeleteAccount.vue'

const { t } = useI18n()

const appStore = useAppStore()
const { logout } = useAuthStore()
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()
const topMenu = computed(() => appStore.topMenu && appStore.menu)
// const toggleTheme = useToggle(isDark)

const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void

const { toggle: toggleLocales } = useToggleLocales()

const { data: selfInfo } = useWeilaFetch<SelfInfo>('corp/user/get-selfinfo')

const resetPasswordModalVisible = shallowRef(false)
const bindingPhoneModalVisible = shallowRef(false)
const deleteAccountModalVisible = shallowRef(false)

function tryLogout() {
  logout()
}

const buildTime = new Date(__BUILD_TIME__).toLocaleString()

const { outdated, update } = useBundleInfo()

useIntervalFn(() => update(), 36_000_000, { immediateCallback: true })

function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <div flex="~ justify-between" border-b p4 pr10>
    <a-space>
      <img alt="logo" rounded-full size-10 src="/src/assets/logo.png">
      <a-typography-title :style="{ margin: 0, fontSize: '18px' }" :heading="5" max-lg:hidden>
        {{ t('project.name') }}
      </a-typography-title>
      <icon-menu-fold
        v-if="!topMenu && appStore.device === 'mobile'" style="font-size: 22px; cursor: pointer"
        @click="toggleDrawerMenu"
      />
      <a-tag color="green" shape="round">
        {{ $t('v-version') }} {{ version }}
      </a-tag>
      <a-button v-if="outdated" shape="round" size="mini" status="warning" space-x-2 @click="reloadPage">
        <icon-refresh /> <span>{{ $t('navbar.system-update') }}</span>
      </a-button>
      <a-tag shape="round" color="gray" space-x-2>
        <icon-code-sandbox /> <span>{{ $t('build-time') }} {{ buildTime }}</span>
      </a-tag>
    </a-space>
    <a-space size="large">
      <li v-if="isDev">
        <a-tooltip :content="t('settings.language')">
          <a-button class="nav-btn" type="outline" shape="circle" @click="toggleLocales">
            <template #icon>
              <icon-language />
            </template>
          </a-button>
        </a-tooltip>
      </li>
      <a-tooltip
        :content="isFullscreen
          ? t('settings.navbar.screen.toExit')
          : t('settings.navbar.screen.toFull')
        "
      >
        <a-button class="nav-btn" type="outline" shape="circle" @click="toggleFullScreen">
          <template #icon>
            <icon-fullscreen-exit v-if="isFullscreen" />
            <icon-fullscreen v-else />
          </template>
        </a-button>
      </a-tooltip>

      <a-dropdown trigger="click" :popup-max-height="false">
        <a-avatar hover:op75 cursor-pointer :image-url="selfInfo?.avatar">
          <IconUser />
        </a-avatar>

        <template #content>
          <div class="p4 flex-col gap-[15px] text-center items-center justify-center">
            <div v-if="selfInfo" class="flex flex-col gap-2">
              <div class="text-lg text-primary font-semibold">
                {{ selfInfo.name }}
              </div>
              <div class="text-secondary text-sm">
                {{ t('weila-number') }}: {{ selfInfo.user_num }}
              </div>
              <div class="flex items-center gap-2">
                <a-tag color="blue" mxa>
                  +{{ selfInfo.country_code }} {{ selfInfo.phone }}
                </a-tag>
              </div>
            </div>
            <div flex="~ col" mt6 gap2>
              <a-button @click="bindingPhoneModalVisible = true">
                {{ t('binding-phone') }}
              </a-button>
              <a-button @click="resetPasswordModalVisible = true">
                {{ t('button.reset-password') }}
              </a-button>
              <a-button @click="tryLogout">
                {{ t('logout') }}
              </a-button>
              <a-button status="danger" @click="deleteAccountModalVisible = true">
                {{ t('button.delete-account') }}
              </a-button>
            </div>
          </div>
        </template>
      </a-dropdown>
    </a-space>
  </div>

  <ResetSelfPasswordModal v-model:open="resetPasswordModalVisible" />
  <BindingPhone v-model:open="bindingPhoneModalVisible" />
  <DeleteAccount v-model:open="deleteAccountModalVisible" />
</template>

<script lang="ts" setup>
import { useFullscreen } from '@vueuse/core'
import { computed, inject, shallowRef } from 'vue'
import Menu from '~/components/menu/index.vue'
import { useAuthStore } from '~/stores/auth'
import { version } from '../../../package.json'
import BindingPhone from '../BindingPhone.vue'

const { t /* locale */ } = useI18n()

const appStore = useAppStore()
const { logout } = useAuthStore()
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()
const topMenu = computed(() => appStore.topMenu && appStore.menu)
// const toggleTheme = useToggle(isDark)

const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void

// async function toggleLocales() {
//   const locales = availableLocales
//   const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
//   await loadLanguageAsync(newLocale)
//   locale.value = newLocale
// }

interface SelfInfo {
  user_id: number
  user_num: string
  job_num: string
  sex: number
  name: string
  avatar: string
  is_admin: number
  dept_id: number
  phone: string
  country_code: string
  state: number
  type: number
  tts: number
  loc_share: number
  track: number
  group_count: number
  created: number
}

const { data: selfInfo } = useWeilaFetch<SelfInfo>('corp/user/get-selfinfo')

const resetPasswordModalVisible = shallowRef(false)
const bindingPhoneModalVisible = shallowRef(false)

function tryLogout() {
  logout()
}
</script>

<template>
  <div class="navbar">
    <div class="left-side" space-x-2>
      <a-space>
        <img alt="logo" rounded-full size-10 src="/src/assets/logo.png">
        <a-typography-title :style="{ margin: 0, fontSize: '18px' }" :heading="5" max-lg:hidden>
          {{ t('project.name') }}
        </a-typography-title>
        <icon-menu-fold
          v-if="!topMenu && appStore.device === 'mobile'" style="font-size: 22px; cursor: pointer"
          @click="toggleDrawerMenu"
        />
      </a-space>
      <a-space>
        <a-tag>{{ version }}</a-tag>
      </a-space>
    </div>
    <div class="center-side">
      <Menu v-if="topMenu" />
    </div>
    <ul class="right-side">
      <!-- <li>
        <a-tooltip :content="t('settings.language')">
          <a-button class="nav-btn" type="outline" shape="circle" @click="toggleLocales">
            <template #icon>
              <icon-language />
            </template>
          </a-button>
        </a-tooltip>
      </li> -->

      <li>
        <!-- <a-button class="nav-btn" type="outline" shape="circle" @click="toggleTheme()">
          <template #icon>
            <icon-moon-fill v-if="!isDark" />
            <icon-sun-fill v-else />
          </template>
        </a-button> -->
      </li>
      <li>
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
      </li>
      <li>
        <a-dropdown trigger="click">
          <a-avatar hover:op75 cursor-pointer :image-url="selfInfo?.avatar">
            <IconUser />
          </a-avatar>

          <template #content>
            <div class="p4 flex-col gap-[15px] text-center">
              <div v-if="selfInfo" class="flex flex-col gap-2">
                <div class="text-lg text-primary font-semibold">
                  {{ selfInfo.name }}
                </div>
                <div class="text-secondary text-sm">
                  {{ t('weila-number') }}: {{ selfInfo.user_num }}
                </div>
                <div class="flex items-center gap-2">
                  <a-tag color="blue">
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
              </div>
            </div>
          </template>
        </a-dropdown>
      </li>
    </ul>
  </div>

  <ResetSelfPasswordModal v-model:open="resetPasswordModalVisible" />
  <BindingPhone v-model:open="bindingPhoneModalVisible" />
</template>

<style scoped lang="less">
.navbar {
  display: flex;
  justify-content: space-between;
  height: 100%;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
}

.left-side {
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.center-side {
  flex: 1;
}

.right-side {
  display: flex;
  padding-right: 20px;
  list-style: none;

  :deep(.locale-select) {
    border-radius: 20px;
  }

  li {
    display: flex;
    align-items: center;
    padding: 0 10px;
  }

  a {
    color: var(--color-text-1);
    text-decoration: none;
  }

  .nav-btn {
    border-color: rgb(var(--gray-2));
    color: rgb(var(--gray-8));
    font-size: 16px;
  }

  .trigger-btn,
  .ref-btn {
    position: absolute;
    bottom: 14px;
  }

  .trigger-btn {
    margin-left: 14px;
  }
}
</style>

<style lang="less">
.message-popover {
  .arco-popover-content {
    margin-top: 0;
  }
}
</style>

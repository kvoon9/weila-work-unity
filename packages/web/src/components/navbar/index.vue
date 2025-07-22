<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query'
import { UseImage } from '@vueuse/components'
import { createReusableTemplate, useFullscreen } from '@vueuse/core'
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

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()

const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void

// async function toggleLocales() {
//   const locales = availableLocales
//   const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
//   await loadLanguageAsync(newLocale)
//   locale.value = newLocale
// }

const hoverState = shallowRef(false)
interface User {
  id: number
  num: string
  sex: number
  name: string
  bind_phone: string
  country_code: string
  avatar: string
}

const { data: user, refetch } = useQuery({
  queryKey: ['user'],
  queryFn: () => weilaFetch<{ user: User }>('/corp/web/user-selfinfo').then(({ user }) => user),
})

const resetPasswordModalVisible = shallowRef(false)
const bindingPhoneModalVisible = shallowRef(false)

function tryLogout() {
  logout()
}
</script>

<template>
  <DefineTemplate>
    <div inline-block size-10>
      <UseImage
        v-if="user?.avatar" :src="user.avatar" alt="upload avatar"
        class="mb-2 of-hidden rounded-full object-cover"
      >
        <template #loading>
          <div class="animate-pulse rounded-full bg-gray-200 size-10" />
        </template>
        <template #error>
          <i i-carbon-user-avatar-filled class="block rounded-full size-10" :src="user?.avatar" alt="Avatar" />
        </template>
      </UseImage>
      <i v-else i-carbon-user-avatar-filled size-10 class="block rounded-full" :src="user?.avatar" alt="Avatar" />
      <!-- <a-avatar :image-url="avatar?.replace(/^https?:/, '')"  :style="{ backgroundColor: '#3370ff' }" :image-url="user?.avatar" /> -->
    </div>
  </DefineTemplate>

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
        <HoverCardRoot v-model:open="hoverState" :open-delay="0">
          <HoverCardTrigger
            class="inline-block cursor-pointer rounded-full shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] outline-none focus:shadow-[0_0_0_2px_white]"
            target="_blank" rel="noreferrer noopener"
          >
            <ReuseTemplate />
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent
              class="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade w-[300px] w-fit rounded-md p8 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] bg-base data-[state=open]:transition-all"
              :side-offset="5"
            >
              <div class="flex flex-col gap-[7px]">
                <ReuseTemplate class="mx-auto" />
                <div class="flex-col gap-[15px] text-center">
                  <div v-if="user" class="flex flex-col gap-2">
                    <div class="text-lg text-primary font-semibold">
                      {{ user.name }}
                    </div>
                    <div class="text-secondary text-sm">
                      {{ t('weila-number') }}: {{ user.num }}
                    </div>
                    <div class="flex items-center gap-2">
                      <a-tag color="blue">
                        +{{ user.country_code }} {{ user.bind_phone }}
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
              </div>

              <HoverCardArrow class="fill-white" :width="8" />
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>
      </li>
    </ul>
  </div>

  <ResetSelfPasswordModal v-model:open="resetPasswordModalVisible" />
  <BindingPhone v-model:open="bindingPhoneModalVisible" @success="refetch" />
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

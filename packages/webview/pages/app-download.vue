<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { AppDownloadLinkType, useAppDownloadLink } from '@weila/network'
import { normalizeURL } from 'ufo'

definePageMeta({
  layout: 'default',
  meta: {
    public: true,
  },
})

const router = useRouter()

const { data } = useAppDownloadLink($v1, {
  type: AppDownloadLinkType.CorpNormal,
})

const url = computed(() => normalizeURL(data.value?.url || ''))

$inspect(data)

const qrcode = useQRCode(url)
</script>

<template>
  <div h-full grid="~ rows-[min-content_1fr]">
    <nav class="flex items-center relative w-full p-4 align-mid text-lg">
      <button>
        <span class="inline-flex items-center" @click="() => router.back()">
          <Icon name="ph:caret-left" />
          返回
        </span>
        <span class="absolute position-center font-semibold">
          软件下载
        </span>
      </button>
    </nav>
    <div v-if="!data" text-center mt30>
      加载数据中...
    </div>
    <section v-else of-auto>
      <div class="p-6 text-center font-sans space-y-6">
        <header class="text-3xl font-thin leading-loose">
          企业集群通，微喇来提供
        </header>
        <main class="space-y-4">
          <div relative>
            <img border="~ 4" class="mx-auto  rounded-lg w-[1/2] lg:w-60 " :src="qrcode" alt="QR Code">
            <img v-if="data?.avatar" absolute position-center bg-white :src="data.avatar" w8 h8 rounded p0.5>
          </div>
          <button class="inline-flex items-center space-x-2 gap-2 rounded-full bg-primary px-4 py-2 text-lg text-white opacity-85 hover:opacity-100">
            <Icon name="ph:android-logo-duotone" class="size-8" />
            <a :href="url">
              Android APP
            </a>
          </button>
        </main>
      </div>
    </section>
  </div>
</template>

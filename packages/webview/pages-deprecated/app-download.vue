<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'

definePageMeta({
  layout: 'default',
  meta: {
    public: true,
  },
})

const router = useRouter()

const href = 'http://download.weila.hk/app/weila-corp.apk'

const qrcode = useQRCode(href)
</script>

<template>
  <div class="relative h-full flex flex-col">
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
    <section class="grow-1 bg-gray-1">
      <div class="p-6 text-center font-sans space-y-6">
        <header class="text-3xl font-thin leading-loose">
          企业集群通，微喇来提供
        </header>
        <main class="space-y-4">
          <img class="mx-auto border rounded-lg w-[1/2] lg:w-60 " :src="qrcode" alt="QR Code">
          <button class="inline-flex items-center space-x-2 gap-2 rounded-full bg-primary px-4 py-2 text-lg text-white opacity-85 hover:opacity-100">
            <Icon name="ph:android-logo-duotone" class="size-8" />
            <a :href>
              Android APP
            </a>
          </button>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { AppDownloadLinkType, useAppDownloadLink } from '@weila/network'
import { normalizeURL } from 'ufo'

definePage({
  meta: {
    requiresAuth: false,
    layout: 'page',
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
  <div relative h-full flex="~ col">
    <nav flex="~ items-center" relative w-full p4 align-mid text-lg>
      <span inline-flex="~ items-center" @click="() => router.back()">
        <i i-ph-caret-left inline-block size-6 /> 返回
      </span>
      <span absolute position-center font-semibold>
        软件下载
      </span>
    </nav>
    <div v-if="!data" mt30 text-center>
      加载数据中...
    </div>
    <section v-else grow-1 bg-gray-1 text-gray-800>
      <div p6 text-center font-sans space-y-6>
        <header text-3xl font-thin leading-loose>
          企业集群通，微喇来提供
        </header>
        <main space-y-4>
          <div relative>
            <img mxa border rounded-lg w="1/2" lg="w-60" :src="qrcode" alt="QR Code">
            <img :src="data.avatar" absolute position-center h8 w8 rounded bg-white p0.5>
          </div>
          <button inline-flex="~ items-center" space-1-2 gap2 rounded-full bg-primary px4 py2 text-lg text-white op85 hover:op100>
            <i i-ph-android-logo-duotone inline-block size-8 />
            <a :href="url">
              Android APP
            </a>
          </button>
        </main>
      </div>
    </section>
  </div>
</template>

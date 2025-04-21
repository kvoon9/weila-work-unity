<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'

definePage({
  meta: {
    requiresAuth: false,
    layout: 'page',
  },
})

const router = useRouter()

const qrcode = useQRCode('text-to-encode')
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
    <section grow-1 bg-gray-1>
      <div p6 text-center font-sans space-y-6>
        <header text-3xl font-thin leading-loose>
          企业集群通，微喇来提供
        </header>
        <main space-y-4>
          <img mxa border rounded-lg w="1/2" lg="w-60" :src="qrcode" alt="QR Code">
          <button inline-flex="~ items-center" space-1-2 gap2 rounded-full bg-primary px4 py2 text-lg text-white op85 hover:op100>
            <i i-ph-android-logo-duotone inline-block />
            <span>
              Android APP
            </span>
          </button>
        </main>
      </div>
    </section>
  </div>
</template>

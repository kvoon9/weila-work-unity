<!-- eslint-disable vue/prop-name-casing -->
<script setup lang="ts">
import type videojs from 'video.js'
import { VideoPlayer } from '@videojs-player/vue'
import { shallowRef } from 'vue'

type VideoJsPlayer = ReturnType<typeof videojs>

defineProps<{
  content: {
    image: string
    video_url: string
    video_size: number
    video_name: string
  }
}>()

const player = shallowRef<VideoJsPlayer>()

function handleMounted(payload: any) {
  player.value = payload.player
}

function handleEvent(log: any) {
  // eslint-disable-next-line no-console
  console.info(log)
}
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <div class="relative overflow-hidden rounded">
        <img
          class="max-size-[20rem] min-size-[15rem]"
          :src="`${content.video_url}?x-oss-process=video/snapshot,t_0,f_jpg,m_fast,w_160`"
          alt="cover"
        >
        <Icon name="carbon:play-filled" class="absolute position-center m-auto block size-14 opacity-70 text-white" />
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ content.video_name.split('.').at(0) }}</DialogTitle>
        <DialogDescription>
          {{ content.video_name }}
        </DialogDescription>
      </DialogHeader>

      <VideoPlayer
        autoplay
        :src="content.video_url" class="video-player vjs-big-play-centered h-[75vh] rounded"
        :poster="content.image" crossorigin="anonymous" controls playsinline :volume="0.6" :height="320"
        :playback-rates="[0.7, 1.0, 1.5, 2.0]" :prefer-full-window="true" @mounted="handleMounted" @ready="handleEvent"
        @play="handleEvent"
        @pause="handleEvent" @ended="handleEvent" @loadeddata="handleEvent" @waiting="handleEvent" @playing="handleEvent"
        @canplay="handleEvent" @canplaythrough="handleEvent" @timeupdate="() => handleEvent(player?.currentTime())"
      />

      <DialogFooter />
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.video-player {
  background-color: black;
  width: 100%;
}
</style>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { useSound } from '@vueuse/sound';
import { weilaApiUrl } from '~/api';

import { useSpeakerIcon } from '~/composables/useSpeakerIcon';

const props = defineProps<{
  content: {
    url: string
    duration: number
  }
  classes?: string | string[]
}>()

const { data: mp3Url } = useQuery({
  queryKey: [props.content.url],
  queryFn: () => weilaFetch(weilaApiUrl('/corp/web/ptturl-to-mp3url'), {
    body: {
      ptturl: props.content.url,
    },
  }).then(i => i.url as string),
})

const { play: playVoice, isPlaying: isVoicePlaying, pause: pauseVoice, duration } = useSound(computed(() => mp3Url.value || ''))

const { counter, reset: resetCounter, pause: pauseCounter, resume: resumeCounter } = useInterval(100, {
  controls: true,
  immediate: false,
})

watch(counter, (val) => {
  if (val * 100 > (duration.value || 0))
    stop()
})

const { icon, play: playIcon, stop: stopIcon, pause: pauseIcon } = useSpeakerIcon()

function play() {
  playVoice()
  playIcon()
  resumeCounter()
}

function pause() {
  pauseVoice()
  pauseIcon()
  pauseCounter()
}

function stop() {
  pauseCounter()
  resetCounter()
  stopIcon()
}

function click() {
  if (!isVoicePlaying.value)
    play()
  else
    pause()
}
</script>

<template>
  <button
    :class="classes" :color="isVoicePlaying ? 'primary' : ''" flex items-center w="30" gap3 rounded p4 text-lg
    @click="click"
  >
    {{ ((duration || 0) / 1000).toFixed(0) }}" <i :class="icon" inline-block />
  </button>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useSound } from '@vueuse/sound'
import clsx from 'clsx'
import { weilaApiUrl } from '~/plugins/api'
import MessageTextContent from './MessageTextContent.vue'

const props = defineProps<{
  content: {
    url: string
    duration: number
  }
  classes?: string | string[]
}>()

const { $v1 } = useNuxtApp()

const { data: mp3Url } = useQuery({
  queryKey: [props.content.url],
  queryFn: () => $v1(weilaApiUrl('/corp/web/ptturl-to-mp3url'), {
    body: {
      ptturl: props.content.url,
    },
  }).then((i: any) => i.url as string),
})

const { play: playVoice, isPlaying: isVoicePlaying, pause: pauseVoice, duration: _duration } = useSound(computed(() => mp3Url.value || ''))

// unit: ms
const duration = computed(() => {
  return _duration.value
    ? _duration.value
    : props.content.duration * 1000
})

const support = computed(() => _duration.value !== 0)

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
  // console.log('props.content', props.content)
  // if (props.content.duration <= 300) {
  //   const { toast } = useToast()
  //   toast({ description: '音频太短了' })
  //   return
  // }

  if (!isVoicePlaying.value)
    play()
  else
    pause()
}
</script>

<template>
  <button
    v-if="support"
    :class="clsx(
      classes,
      isVoicePlaying ? 'text-primary' : '',
      'flex items-center w-30 space-x-3 rounded p-4 text-lg',
    )"
    @click="click"
  >
    {{ ((duration || 0) / 1000).toFixed(0) }}"

    <Icon :name="icon" class="inline-block" />
  </button>
  <MessageTextContent v-else class="text-neutral-600" content="[ 您的浏览器不支持音频消息，请使用新版本的 QQ、Edge、UC 或者夸克浏览器打开查看 ]" />
</template>

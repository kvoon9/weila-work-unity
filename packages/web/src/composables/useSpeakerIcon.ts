export function useSpeakerIcon() {
  const [icon, switchSpeakerIcon] = useToggle('i-ph-speaker-low-duotone', {
    truthyValue: 'i-ph-speaker-high-duotone',
    falsyValue: 'i-ph-speaker-low-duotone',
  })

  const iconTimer = useIntervalFn(() => switchSpeakerIcon(), 500, {
    immediate: false,
    immediateCallback: true,
  })

  function play() {
    iconTimer.resume()
  }

  function stop() {
    iconTimer.pause()
    switchSpeakerIcon('i-ph-speaker-low-duotone')
  }

  function pause() {
    iconTimer.pause()
    // @unocss-include
    icon.value = 'i-ph-pause'
  }

  return {
    icon,
    stop,
    play,
    pause,
  }
}

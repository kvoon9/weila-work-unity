export function useSpeakerIcon() {
  const [icon, switchSpeakerIcon] = useToggle('ph:speaker-low-duotone', {
    truthyValue: 'ph:speaker-high-duotone',
    falsyValue: 'ph:speaker-low-duotone',
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
    switchSpeakerIcon('ph:speaker-low-duotone')
  }

  function pause() {
    iconTimer.pause()
    // @unocss-include
    icon.value = 'ph:pause'
  }

  return {
    icon,
    stop,
    play,
    pause,
  }
}

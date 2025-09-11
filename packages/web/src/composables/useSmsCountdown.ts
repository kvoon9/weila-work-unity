import { timestamp } from '~/shared/states'

export function useSmsCountdown(storageKey: string) {
  const lastSendTime = useLocalStorage(storageKey, -1)
  
  const countdown = computed(() => {
    if (lastSendTime.value === -1) return 0
    const elapsed = Math.floor((timestamp.value / 1000) - (lastSendTime.value / 1000))
    return Math.max(0, 60 - elapsed)
  })
  
  const isCounting = computed(() => countdown.value > 0)
  const canSend = computed(() => countdown.value <= 0)
  
  function updateSendTime() {
    lastSendTime.value = timestamp.value
  }
  
  function reset() {
    lastSendTime.value = -1
  }
  
  return {
    countdown,
    isCounting,
    canSend,
    updateSendTime,
    reset
  }
}
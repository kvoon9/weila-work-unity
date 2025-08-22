import { shallowRef } from 'vue'

export const useBundleInfo = createSharedComposable(() => {
  const outdated = shallowRef(false)
  const update = async () => {
    if (!import.meta.env.PROD)
      return outdated.value = false

    const res = await fetch('/build-info.json')
    if (!res.ok) {
      return outdated.value = false
    }

    const { timestamp }: { timestamp: number } = await res.json()

    if (String(timestamp) !== String(__BUILD_TIME__)) {
      return outdated.value = true
    }
  }

  return {
    outdated,
    update,
  }
})

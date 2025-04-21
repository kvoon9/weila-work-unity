import { isString } from '@antfu/utils'
import { shallowRef } from 'vue'

export const useToast = createSharedComposable(() => {
  const timer = shallowRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const title = shallowRef('')
  const description = shallowRef('')
  const open = shallowRef(false)

  const toast = (opts: string | { title?: string, description?: string }) => {
    const options = isString(opts) ? { title: '', description: opts } : opts
    title.value = options?.title || ''
    description.value = options?.description || ''

    open.value = true

    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = undefined
    }

    timer.value = setTimeout(() => {
      open.value = false
    }, 1500)
  }

  return {
    open,
    title,
    description,
    timer,
    toast,
  }
})

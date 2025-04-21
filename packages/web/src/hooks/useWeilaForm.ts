import type Form from '@arco-design/web-vue/es/form'
import type { ComponentInstance, Reactive, Ref } from 'vue'

export function useWeilaForm<T extends object>(opts: {
  defaultValue: T
  templateRef: any
  onSubmit?: (payload: T) => void
  onError?: (errors: any) => void
}): {
    values: Reactive<T>
    handleSubmit: () => void
  } {
  const {
    templateRef,
    defaultValue,
    onSubmit,
    onError,
  } = opts

  // TODO: improve type
  const tref = templateRef as Readonly<Ref<ComponentInstance<typeof Form> | null>>

  const values = reactive<T>(defaultValue)

  const handleSubmit = () => {
    return tref.value?.validate((errors) => {
      if (errors) {
        onError?.(errors)
        return
      }

      onSubmit?.(unref(values))
    })
  }

  return {
    values,
    handleSubmit,
  }
}

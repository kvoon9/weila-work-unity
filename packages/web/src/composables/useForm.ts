import type { BaseSchema } from 'valibot'
import { clearUndefined, isFunction, objectEntries } from '@antfu/utils'
import * as v from 'valibot'
import { ref as deepRef } from 'vue'
import { valibotArcoRules } from 'zod-arco-rules'

export function useForm<
  T extends object,
  K extends keyof T = keyof T,
>(form: Record<K, {
  value: MaybeRefOrGetter<T[K]>
  rule?: BaseSchema<any, any, any>
}>, options?: {
  watch?: MaybeRefOrGetter[]
  defaultSource?: MaybeRefOrGetter<any>
}) {
  const {
    watch: watchList = [],
    defaultSource,
  } = options || {}

  const rawRules = {} as any
  const rawForm = {} as T
  for (const [key, { rule, value }] of objectEntries(form)) {
    rawRules[key] = rule
    rawForm[key] = toValue(value)
  }
  const reactiveForm = deepRef(rawForm)
  const { rules, handleSubmit } = valibotArcoRules<T>(v.object(
    clearUndefined(rawRules),
  ))

  const reset = () => {
    for (const [key, { value }] of objectEntries(form)) {
      reactiveForm.value[key] = toValue(value)
    }
  }

  watch(watchList, () => {
    reset()
  })

  // update default value
  if (defaultSource && (isRef(defaultSource) || isFunction(defaultSource))) {
    watch(defaultSource, () => {
      for (const [key] of objectEntries(form)) {
        const value = toValue(defaultSource)[key]
        reactiveForm.value[key] = value
      }
    })
  }

  return {
    rules,
    handleSubmit,
    form: reactiveForm,
    reset,
  }
}

// interface NormalizedFormValue {
//   value: any
//   rule?: BaseSchema<any, any, any>
// }

// NOTE: value: any ---> { value: any, rule: undefined }
// function normalizeValue(maybeValue: any) {
//   const isValue = maybeValue?.value === undefined
//   return (
//     isValue
//       ? { value: maybeValue, rule: undefined }
//       : maybeValue
//   ) as NormalizedFormValue
// }

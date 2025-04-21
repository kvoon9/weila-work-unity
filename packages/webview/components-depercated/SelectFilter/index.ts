import type { HeaderContext } from '@tanstack/vue-table'
import SelectFilter from '~/components/SelectFilter/comp.vue'

export interface Item<T> {
  name: string
  value: T
}

export function useSelectFilterHeader<T>(
  // TODO: may improve context type
  ctx: HeaderContext<any, any>,
  name: MaybeRefOrGetter<string>,
  items: MaybeRefOrGetter<Item<T>[]>,
  options?: {
    class?: string | string[]
  },
) {
  const { column, table } = ctx

  return h(
    SelectFilter,
    {
      'name': toValue(name),
      'items': toValue(items),
      'onUpdate:value': (value: unknown) => {
        if (value === null)
          table.resetColumnFilters()
        else
          column.setFilterValue(value)
      },
      ...options,
    },
  )
}

export { default as SelectFilter } from './comp.vue'

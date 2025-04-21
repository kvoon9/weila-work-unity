import type { ColumnFiltersState, Updater } from '@tanstack/vue-table'
import { isFunction } from '@tanstack/vue-table'

export function valueUpdater(target: Ref<any>, updaterOrValue: Updater<ColumnFiltersState>) {
  target.value = isFunction(updaterOrValue)
    ? updaterOrValue(target.value)
    : updaterOrValue
}

export function useValueUpdaterFn(target: Ref<any>) {
  return (updaterOrValue: Updater<ColumnFiltersState>) => {
    valueUpdater(target, updaterOrValue)
  }
}

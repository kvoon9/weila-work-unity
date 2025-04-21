import type { DateValue } from '@internationalized/date'
import { isDate } from '@antfu/utils'
import { getLocalTimeZone } from '@internationalized/date'

export function createFormattedDate(date: Date | DateValue | undefined): string {
  if (!date)
    return ''

  date = isDate(date) ? date : date.toDate(getLocalTimeZone())

  const year = date.getFullYear()
  const month = date.getMonth() + 1 // Convert to 1-based index
  const day = date.getDate()

  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

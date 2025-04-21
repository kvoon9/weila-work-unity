import type { ColumnDef } from '@tanstack/vue-table'
import type { DeptGetallModel } from '~/fixture/mock'
import { h } from 'vue'

export type Data = DeptGetallModel['data']['depts'] | never[]

export type ColsDef = ColumnDef<
  Data[number]
>[]

export const columns: ColsDef = [
  {
    accessorKey: 'name',
    header: '名称',
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium' },
        row.getValue('name'),
      )
    },
  },
  {
    accessorKey: 'user_count',
    header: '用户数',
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium' },
        row.getValue('user_count'),
      )
    },
  },
]

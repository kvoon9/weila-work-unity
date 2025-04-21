import type { ColumnDef } from '@tanstack/vue-table'
import type { GroupGetallModel } from '~/fixture/mock'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '#components'
import { isString } from '@antfu/utils'
import { h } from 'vue'

export type Data = GroupGetallModel['data']['groups']

export type ColsDef = ColumnDef<
  Data[number]
>[]

const _columns: ColsDef = [
  {
    accessorKey: 'avatar',
    header: '头像',
    cell({ row }) {
      return h(
        Avatar,
        {},
        [
          h(AvatarImage, { src: row.original.avatar }),
          h(AvatarFallback, {}, '错误'),
        ],
      )
    },
  },
  {
    accessorKey: 'name',
    header: '名称',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'font-medium break-keep' },
        row.getValue('name'),
      )
    },
  },
  {
    accessorKey: 'user_count',
    header: '用户数',
    cell: ({ row }) => h(
      'div',
      { class: 'font-medium break-keep' },
      row.getValue('user_count'),
    ),
  },
  {
    accessorKey: 'burst_mode',
    header: '对讲模式',

    cell: ({ row }) => {
      return h(
        Badge,
        { class: 'font-medium break-keep' },
        () => ({
          0: '排麦',
          1: '抢麦',
          2: '抢断',
        }[row.original.burst_mode as 0 | 1 | 2]),
      )
    },
  },
  {
    accessorKey: 'created',
    header: '创建时间',
    cell: ({ row }) => {
      return h(
        'div',

        { class: 'font-medium break-keep' },
        new Date(row.original.created * 1000).toLocaleDateString(),
      )
    },
  },
]

export const columns = _columns.map((i) => {
  return {
    ...i,
    header: isString(i.header)
      ? () => h('div', { class: 'break-keep' }, i.header as string)
      : i.header,
  }
})

import type { ColumnDef } from '@tanstack/vue-table'
import type { GroupMemberGetallModel } from '~/fixture/mock'
import { Avatar, AvatarFallback, AvatarImage, Badge } from '#components'
import { isString } from '@antfu/utils'
import { h } from 'vue'

export type Data = GroupMemberGetallModel['data']['members'] | never[]

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
        { class: ' font-medium break-keep' },
        row.getValue('name'),
      )
    },
  },
  {
    accessorKey: 'user_num',
    header: '微喇号',
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium' },
        row.getValue('user_num'),
      )
    },
    filterFn: 'includesString',
  },
  {
    accessorKey: 'phone',
    header: '电话',
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium' },
        row.getValue('phone'),
      )
    },

  },
  {
    accessorKey: 'tts',
    header: 'TTS',
    cell: ({ row }) => {
      return h(
        Badge,
        {
          class: 'font-medium break-keep',
          variant: row.original.tts ? 'default' : 'secondary',
        },
        () => row.getValue('tts') ? '打开' : '关闭',
      )
    },
  },

  {
    accessorKey: 'loc_share',
    header: '位置共享',
    cell: ({ row }) => {
      return h(
        'div',
        {},
        h(
          Badge,
          {
            class: 'font-medium break-keep',
            variant: row.original.loc_share ? 'default' : 'secondary',
          },
          () => row.getValue('loc_share') ? '开启' : '关闭',
        ),
      )
    },
  },

  {
    accessorKey: 'track',
    header: '轨迹',
    cell: ({ row }) => {
      const trackTypeMap = {
        0: '关闭',
        1: '高',
        2: '中等',
        3: '低',
      }

      type TrackType = keyof typeof trackTypeMap

      return h(
        Badge,
        {
          class: 'font-medium break-keep',
          variant: row.original.track ? 'default' : 'secondary',
        },
        () => trackTypeMap[row.getValue('track') as TrackType],
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

import type { ColumnDef } from '@tanstack/vue-table'
import type { MemberGetallModel } from '~/fixture/mock'
import { isString } from '@antfu/utils'
import { h } from 'vue'
import { useSelectFilterHeader } from '~/components/SelectFilter'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import AvatarFallback from '~/components/ui/avatar/AvatarFallback.vue'
import AvatarImage from '~/components/ui/avatar/AvatarImage.vue'
import { Badge } from '~/components/ui/badge'

export type Data = MemberGetallModel['data']['members']

export type ColsDef = ColumnDef<
  Data[number]
>[]

export const _columns: ColsDef = [
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
    accessorKey: 'type',
    header: ctx => useSelectFilterHeader(ctx, '类型', [
      { name: '成员', value: 0 },
      { name: '设备', value: 1 },
      { name: '企业主', value: 255 },
    ], {
      class: 'w-[60px]',
    }),
    cell({ row }) {
      const value = row.getValue('type') as 0 | 1 | 255

      const nameMap = {
        0: '成员',
        1: '设备',
        255: '企业主',
      }

      return h(
        'div',
        { class: ' font-medium min-w-12' },
        nameMap[value],
      )
    },
    filterFn: 'equals',
  },
  {
    accessorKey: 'online',
    header: '在线',
    cell({ row }) {
      return h(
        'div',
        { class: ' font-medium min-w-12' },
        row.original.online ? '在线' : '离线',
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
    accessorKey: 'job_num',
    header: '工号',
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium min-w-12' },
        row.getValue('job_num'),
      )
    },

  },
  {
    accessorKey: 'dept_name',
    header: (ctx) => {
      const { data } = useDepts()

      return useSelectFilterHeader(
        ctx,
        '部门',
        computed(() => (data.value || []).map(i => ({
          name: i.name,
          // TODO: may use i.id ?
          value: i.name,
        }))),
        {
          class: 'min-w-[60px]',
        },
      )
    },
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium min-w-12' },
        row.getValue('dept_name'),
      )
    },

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
    accessorKey: 'created',
    header: '创建时间',
    cell: ({ row }) => {
      return h(
        'div',
        { class: ' font-medium' },
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

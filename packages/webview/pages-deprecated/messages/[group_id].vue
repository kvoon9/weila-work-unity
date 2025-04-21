<script setup lang="ts">
import type { Reactive } from 'vue'
import type { MessageGetGroupHistoryMessageModel, MessageGetGroupHistoryMessagePayload } from '~/fixture/mock'
import {
  MessageFileContent,
  MessageLocationContent,
  MessagePictureContent,
  MessageRevokeContent,
  MessageTextContent,
  MessageUnsupportedContent,
  MessageVideoContent,
  MessageVoiceContent,
} from '#components'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/plugins/api'

const route = useRoute('messages-group_id___zh-CN')

enum MessageType {
  Text,
  Picture,
  Video,
  Voice,
  File,
  _, // placeholder
  Location,
  Revoke,
  Unsupported = 255,
}

const messageTypeComponentMap = {
  [MessageType.Text]: MessageTextContent,
  [MessageType.Picture]: MessagePictureContent,
  [MessageType.Video]: MessageVideoContent,
  [MessageType.Voice]: MessageVoiceContent,
  [MessageType.File]: MessageFileContent,
  [MessageType.Location]: MessageLocationContent,
  [MessageType.Revoke]: MessageRevokeContent,
  [MessageType.Unsupported]: MessageUnsupportedContent,
}

definePageMeta({
  layout: 'dashboard',
})

const { data: groups } = useGroups()

watchEffect(() => {
  const name = groups.value
    ?.find(group => String(group.id) === route.params.group_id)
    ?.name || ''

  route.meta.breadcrumb = [
    { name: '历史消息' },
    { name },
  ]
})

const INIT_ID = 0
const pageSize = ref(5)

const isDatePickerOpen = ref(false)
const selectedDate = ref<any>(undefined)
const formattedDate = ref<string>('')

watchEffect(() => {
  if (selectedDate.value !== undefined)
    isDatePickerOpen.value = false
})
watch(isDatePickerOpen, (open) => {
  if(open)
    selectedDate.value = undefined
})

const { $v1 } = useNuxtApp()

const messageContainerEl = templateRef<any>('messageContainerEl')

const payload: Reactive<MessageGetGroupHistoryMessagePayload> = reactive({
  group_id: Number(route.params.group_id),
  msg_id: INIT_ID,
  msg_count: pageSize,
  date: formattedDate,
})

const users = reactive<Record<string, MessageGetGroupHistoryMessageModel['data']['users'][number]>>({})

const topEl = templateRef<HTMLDivElement>('topEl')
const topElVisible = useElementVisibility(topEl)
const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
  enabled: computed(() => Boolean(selectedDate.value)),
  initialPageParam: INIT_ID,
  queryKey: [
    weilaApiUrl('/corp/web/message-get-group-history-message'), 
    formattedDate,
    payload.group_id
  ],
  queryFn: async ({ pageParam }) => {
    // eslint-disable-next-line no-console
    console.log('pageParam', pageParam)

    payload.msg_id = pageParam

    return await $v1<
      MessageGetGroupHistoryMessageModel['data']
    >(weilaApiUrl('/corp/web/message-get-group-history-message'), {
      body: payload,
    })
      .then((i) => {
        for (const user of i.users) {
          users[user.user_id] = user
        }
        return i
      })
      .then(i => i.messages)
  },
  getNextPageParam: (lastPage) => {
    if (!topElVisible.value)
      return undefined

    if (lastPage.length < pageSize.value)
      return undefined

    const ids = lastPage.map(i => i.msg_id)

    if (!ids.length)
      return undefined

    return Math.min(...ids)
  },
})

watch(topElVisible, (visible) => {
  if (visible)
    fetchNextPage()
})

watch(selectedDate, (newVal, oldVal) => {
  if(newVal && !oldVal)
    refetch()
})
</script>

<template>
  <div class="h-full relative pt-2 flex flex-col">
    <DatePicker v-model:open="isDatePickerOpen" v-model:formated-value="formattedDate" v-model:value="selectedDate" default="today" class="md:w-56 w-full h-[3rem] mb-[1rem]" />
    <div v-if="
      !data?.pages.length
      || !Object.keys(users).length
      || (data.pages.length === 1 && !data.pages[0].length)
      " class="text-center mt-4 flex items-center justify-center text-neutral-500/70">
      <Icon name="ph:coffee" class="mr-2" />
      <span>暂无数据</span>
    </div>
    <ul v-else ref="messageContainerEl" class="relative bg-neutral-100 flex-1 py-2 px-2 flex border rounded-md flex-col-reverse overflow-y-scroll scroll-smooth">
      <template v-for="page in data?.pages">
        <li v-for="message in page" :key="message.msg_id" class="flex gap-1 py-3">
          <Avatar>
            <AvatarImage :src="users[message.user_id]?.avatar" alt="@radix-vue" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <section>
            <div class="text-neutral-500">
              <div class="space-x-2">
                <span>
                  {{ users[message.user_id]?.name }}({{ users[message.user_id]?.user_num }})
                </span>
                <span>
                  {{ new Date(message.created * 1000).toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="max-w-[70vw]">
              <!-- @vue-expect-error type error -->
              <component
                :is="
                  messageTypeComponentMap[message.type]
                    || MessageUnsupportedContent
                "
                class="bg-white dark-bg-neutral-8 opacity-85 hover:opacity-100"
                :content="message.content"
              />
            </div>
          </section>
        </li>
      </template>
      <div ref="topEl" class="min-h-2 w-full text-neutral-400 text-center py-2 my-2">
        <!-- {{ hasNextPage ? '' : '-已经到顶了喔-' }} -->
      </div>
    </ul>
  </div>
</template>

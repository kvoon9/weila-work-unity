<script setup lang="ts">
import type { MessageGetGroupHistoryMessageModel, MessageGetGroupHistoryMessagePayload } from 'generated/mock/weila'
import type { Reactive } from 'vue'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { weilaApiUrl } from '~/api'

import MessageFileContent from '~/components/MessageFileContent.vue'
import MessageLocationContent from '~/components/MessageLocationContent.vue'
import MessagePictureContent from '~/components/MessagePictureContent.vue'
import MessageRevokeContent from '~/components/MessageRevokeContent.vue'
import MessageTextContent from '~/components/MessageTextContent.vue'
import MessageUnsupportedContent from '~/components/MessageUnsupportedContent.vue'
import MessageVideoContent from '~/components/MessageVideoContent.vue'
import MessageVoiceContent from '~/components/MessageVoiceContent.vue'

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

const route = useRoute('/message/[group_id]-[group_name]')

const messageContainerEl = templateRef('messageContainerEl')
const { arrivedState } = useScroll(messageContainerEl)

const INIT_ID = 0
const pageSize = ref(20)

function getToday() {
  return new Date().toISOString().split('T')[0]
}

const date = ref(getToday())

const payload: Reactive<MessageGetGroupHistoryMessagePayload> = reactive({
  group_id: Number(route.params.group_id),
  msg_id: INIT_ID,
  msg_count: pageSize,
  date,
})

const users = reactive<Record<string, MessageGetGroupHistoryMessageModel['data']['users'][number]>>({})

const { data, fetchNextPage } = useInfiniteQuery({
  enabled: computed(() => Boolean(date.value)),
  initialPageParam: INIT_ID,
  queryKey: [weilaApiUrl('/corp/web/message-get-group-history-message'), date],
  queryFn: async ({ pageParam = INIT_ID }) => {
    payload.msg_id = pageParam

    return await weilaFetch<
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
    if (lastPage.length < pageSize.value)
      return undefined

    return Math.min(...lastPage.map(i => i.msg_id))
  },
})

watch(arrivedState, ({ top }) => {
  if (top)
    fetchNextPage()
})

$inspect(data)
</script>

<template>
  <main class="absolute inset-0 flex flex-col text-gray-900 bg-base dark:text-gray-100">
    <header flex items-center gap4 p-4 dark:bg-dark-300>
      <h1 class="text-2xl font-bold">
        {{ route.params.group_name }}
      </h1>
      <a-date-picker v-model="date" />
    </header>

    <a-empty v-if="!data?.pages.length || !Object.keys(users).length" mt30 h-full />
    <ul
      v-else
      ref="messageContainerEl" relative flex grow-1 flex-col flex-col-reverse of-scroll overflow-y-auto
      scroll-smooth bg-neutral-1 p-4 space-y-4
      dark:bg-dark-800
    >
      <template v-for="page in data?.pages">
        <li v-for="message in page" id="message-list" :key="message.msg_id" flex gap1 p-3>
          <section>
            <a-avatar>
              <img alt="avatar" :src="users[message.user_id]?.avatar">
            </a-avatar>
          </section>
          <section>
            <div color-neutral>
              <div space-x-2>
                <span>
                  {{ users[message.user_id]?.name }}({{ users[message.user_id]?.user_num }})
                </span>
                <span>
                  {{ new Date(message.created * 1000).toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="content">
              <!-- @vue-expect-error type error -->
              <component :is="messageTypeComponentMap[message.type] || MessageUnsupportedContent" :content="message.content" />
            </div>
          </section>
        </li>
      </template>
      <a-back-top target-container="#message-list" absolute :visible-height="0" />
    </ul>
  </main>
</template>

<style scoped>
.content > * {
  --uno: bg-white dark-bg-neutral-8 op85 hover-op100;
}
</style>

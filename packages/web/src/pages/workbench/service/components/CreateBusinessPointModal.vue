<script setup lang="ts">
import Message from '@arco-design/web-vue/es/message'
import { createBusinessPoint } from '@weila/network'
import { reactive, ref } from 'vue'

const props = defineProps<{
  sid: number
}>()

const open = ref(false)
const form = reactive({
  name: '',
  phone: '',
})
const formRef = ref()

const { mutateAsync: create, isPending } = createBusinessPoint($v2)

async function handleSubmit() {
  formRef.value?.validate?.(async (errors: any) => {
    if (errors)
      return

    await create({
      sid: props.sid,
      name: form.name,
      phone: form.phone,
    })
    Message.success('创建成功')
    formRef.value?.resetFields?.()
    open.value = false
  })
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>
      <slot />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="data-[state=open]:animate-overlayShow fixed inset-0 z-100 bg-black:60" />
      <DialogContent
        bg-base
        class="fixed left-[50%] top-[50%] z-[100] max-h-[85vh] max-w-[450px] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:animate-ease-in focus:outline-none"
      >
        <DialogTitle class="m0 text-center text-lg font-semibold leading-loose">
          创建服务点
        </DialogTitle>
        <a-form ref="formRef" :model="form" @submit="handleSubmit">
          <a-form-item field="name" label="名称" :rules="[{ required: true }]">
            <a-input v-model="form.name" :max-length="20" show-word-limit />
          </a-form-item>
          <a-form-item field="phone" label="电话" :rules="[{ required: true }]">
            <a-input v-model="form.phone" :max-length="20" show-word-limit />
          </a-form-item>
        </a-form>
        <div class="mt-[25px] flex justify-end">
          <a-button type="text" @click="() => formRef?.resetFields?.()">
            重置
          </a-button>
          <DialogClose as-child>
            <a-button>
              取消
            </a-button>
          </DialogClose>
          <a-button type="primary" :loading="isPending" @click="(e) => formRef?.handleSubmit?.(e)">
            提交
          </a-button>
        </div>
        <DialogClose
          class="text-grass11 absolute right-[10px] top-[10px] h-[25px] w-[25px] inline-flex appearance-none items-center justify-center rounded-full hover:bg-gray2 focus:shadow-[0_0_0_2px] focus:shadow-gray7 focus:outline-none"
          aria-label="Close"
        >
          <i i-carbon-close />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

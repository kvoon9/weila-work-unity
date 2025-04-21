<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useToast } from '~/components/ui/toast'
import { loginSchema } from '~/stores/auth'
import { $inspect } from '~/utils/inspect'

definePageMeta({
  layout: 'welcome',
  meta: {
    public: true,
  },
  alias: '/',
})

const { toast } = useToast()

const formSchema = loginSchema

const { login } = useAuthStore()

const { handleSubmit, controlledValues, setFieldValue } = useForm({
  validationSchema: toTypedSchema(formSchema),
})

const remember = ref(false)

$inspect(controlledValues)

const onSubmit = handleSubmit((form) => {
  login(form, {
    remember: remember.value,
  }).catch((errmsg) => {
    toast({
      title: '登录失败',
      description: String(errmsg),
    })
  })
})

const { accountHistoryRecord } = storeToRefs(useAuthStore())
const open = ref(false)
</script>

<template>
  <div class="mx-auto grid w-[350px] gap-6 max-md:border p-4 rounded-md shadow-sm">
    <div class="grid gap-2 text-center">
      <h1 class="text-3xl font-bold">
        登录
      </h1>
      <p class="text-balance text-muted-foreground">
        输入微喇号或手机号登录
      </p>
    </div>
    <form class="space-y-6" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="account">
        <FormItem>
          <FormLabel>账号</FormLabel>
          <FormControl>
            <Popover v-if="accountHistoryRecord.size" v-model:open="open">
              <PopoverTrigger as-child>
                <div class="space-y-2">
                  <Input type="text" v-bind="componentField" />
                </div>
              </PopoverTrigger>
              <PopoverContent align="start" class="p-0">
                <ul>
                  <li
                    v-for="account in Array.from(accountHistoryRecord.keys())" :key="account"
                    class="hover:bg-neutral-200 p-2"
                    @click="() => {
                      setFieldValue('account', account);
                      setFieldValue('password', accountHistoryRecord.get(account))
                      open = false
                    }"
                  >
                    {{ account }}
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
            <div v-else class="space-y-2">
              <Input type="text" v-bind="componentField" />
            </div>
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>密码</FormLabel>
          <FormControl>
            <Input type="password" v-bind="componentField" />
          </FormControl>
          <FormDescription />
          <FormMessage />
        </FormItem>
        <!-- <NuxtLink to="/register" class="text-sm underline"> -->
        <div class="flex justify-between">
          <NuxtLink to="/reset-password" class="text-sm underline">
            忘记密码?
          </NuxtLink>
          <div class="text-sm flex items-center gap-2">
            <Checkbox id="remember" v-model:checked="remember" />
            <label for="remember">记住密码</label>
          </div>
        </div>
      </FormField>
      <Button type="submit" class="w-full">
        登录
      </Button>
      <div class="mt-4 text-center text-sm">
        没有账号?
        <NuxtLink to="/register" class="underline">
          注册
        </NuxtLink>
      </div>
      <div class="mt-4 text-center text-sm">
        下载
        <NuxtLink to="/app-download" class="underline">
          安卓 APP
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

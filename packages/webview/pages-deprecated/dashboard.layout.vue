<script setup lang=ts>
import type { UserBindPhonePayload, UserChangePasswordModel, UserChangePasswordPayload, UserSelfinfoModel } from '~/fixture/mock'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import Logo from 'assets/logo.png'
import { ChevronRight, ChevronsUpDown, GalleryVerticalEnd, LucideContact, LucideLocate, Mail, Plus } from 'lucide-vue-next'
import md5 from 'md5'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { version } from '~~/package.json'
import { useToast } from '~/components/ui/toast/use-toast'
import { useGroups } from '~/composables/groupList'
import { weilaApiUrl } from '~/plugins/api'

const { $v1 } = useNuxtApp()
const { toast } = useToast()

const { data: corp, refetch } = useCorp()
const router = useRouter()
const { logout } = useAuthStore()

const sidebarRef = templateRef<any>('sidebarRef') as Ref<InstanceType<typeof Sidebar>>
// const openMobile = computed(() => sidebarRef.value?.openMobile.value)

const state = computed<'expanded' | 'collapsed'>(() => sidebarRef.value?.state)

router.afterEach(() => {
  sidebarRef.value?.setOpenMobile(false)
})

const isCreateOpen = ref(false)

const { data: groups } = useGroups()

const data = computed(() => ({
  teams: [corp.value].map(i => ({
    ...i,
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',

  })),
  navMain: [
    {
      title: '历史消息',
      url: '#123',
      icon: Mail,
      isActive: true,
      items: (groups.value || []).map((i) => {
        return {
          title: i.name,
          url: `/messages/${i.id}`,
        }
      }),
    },
    {
      title: '通讯录',
      url: '#123',
      icon: LucideContact,
      isActive: true,
      items: [
        {
          title: '群组管理',
          url: '/groups',
        },
        {
          title: '部门管理',
          url: '/deps',
        },
        {
          title: '成员管理',
          url: '/members',
        },
      ],
    },
  ],
  projects: [
    {
      name: '用户轨迹',
      url: '/workspace/user-track',
      icon: LucideLocate,
    },
  ],
}))

const activeTeam = ref<any>(data.value.teams[0])

function setActiveTeam(team: typeof data.value.teams[number]) {
  activeTeam.value = team

  router.push('/org')
}

const { data: user, refresh: refetchUser } = useAsyncData(
  'self-info',
  () => $v1<UserSelfinfoModel['data']>(weilaApiUrl('/corp/web/user-selfinfo')),
  {
    transform(data) {
      return data.user
    },
  },
)

/**
 * Bind Phone
 */

const isBindPhoneOpen = ref(false)
const bindPhoneSchema = z.object({
  phone: z.string().nonempty().max(20),
  img_verify_code: z.string().nonempty(),
  verify_code: z.string().nonempty(),
  password: z.string().nonempty().max(20),
})

const verifyImg = templateRef<any>('verifyImg')
const { handleSubmit, controlledValues } = useForm({
  validationSchema: toTypedSchema(bindPhoneSchema),
})

const { mutate: bindPhone } = useMutation({
  mutationFn: handleSubmit((values) => {
    return $v1(
      weilaApiUrl('/corp/web/user-bind-phone'),
      {
        body: {
          phone: values.phone,
          password: md5(values.password),
          verify_code: values.verify_code,
        } as UserBindPhonePayload,
      },
    ).then(() => {
      toast({ title: '绑定成功' })
      isBindPhoneOpen.value = false
      refetchUser()
    })
  }),
})

/**
 * Reset Password
 */

const isResetPasswordOpen = ref(false)
const resetPasswordSchema = z.object({
  old_password: z.string(),
  new_password: z.string(),
})

const { mutate: resetPassword } = useMutation({
  mutationFn: (values: z.infer<typeof resetPasswordSchema>) => $v1<UserChangePasswordModel>(
    weilaApiUrl('/corp/web/user-change-password'),
    {
      body: {
        old_password: md5(values.old_password),
        new_password: md5(values.new_password),
      } as UserChangePasswordPayload,
    },
  ),
  onSuccess() {
    toast({ title: '重置成功' })
    isResetPasswordOpen.value = false
  },
})

function onVerifyImgCodeError() {
  verifyImg.value?.refetch()
  controlledValues.value.img_verify_code = ''
}
</script>

<template>
  <SidebarProvider>
    <Sidebar ref="sidebarRef" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem v-if="state === 'expanded'">
            <div class="hidden md:visible md:flex items-center space-x-2 px-2 border-b pt-1 pb-4">
              <Avatar>
                <AvatarImage :src="Logo" alt="logo" />
                <AvatarFallback>logo</AvatarFallback>
              </Avatar>
              <span class="text-lg font-semibold">
                微喇企业管理系统
              </span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border bg-neutral-50"
                >
                  <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <component :is="activeTeam.logo" class="size-4" />
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ corp?.name }}</span>
                    <span class="truncate text-xs">我的企业</span>
                  </div>
                  <ChevronsUpDown class="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                :side-offset="4"
              >
                <DropdownMenuLabel class="text-xs text-muted-foreground">
                  我的企业
                </DropdownMenuLabel>
                <DropdownMenuItem
                  v-for="(team, index) in data.teams"
                  v-show="corp"
                  :key="index"
                  class="space-x-2 p-2"
                  @click="setActiveTeam(team)"
                >
                  <div class="flex size-6 items-center justify-center rounded-sm border">
                    <component :is="GalleryVerticalEnd" class="size-4 shrink-0" />
                  </div>
                  {{ corp?.name }}
                  <!-- <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut> -->
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem v-if="!corp" class="space-x-2 p-2" @click=" isCreateOpen = true ">
                  <div class="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus class="size-4" />
                  </div>
                  <div class="font-medium text-muted-foreground">
                    创建企业
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup v-if="corp" class="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>工作台</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="item in data.projects"
              :key="item.name"
            >
              <SidebarMenuButton as-child size="lg">
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.name }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup v-if="corp">
          <SidebarGroupLabel>通讯录</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible
              v-for="item in data.navMain"
              :key="item.title"
              as-child
              :default-open="item.isActive"
              class="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton :tooltip="item.title" size="lg">
                    <component :is="item.icon" />
                    <span class="text-nowrap">{{ item.title }}</span>
                    <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem
                      v-for="subItem in item.items"
                      :key="subItem.title"
                      size="lg"
                    >
                      <SidebarMenuSubButton as-child size="md" class="py-6">
                        <NuxtLink :to="subItem.url">
                          <span>{{ subItem.title }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border bg-neutral-50"
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage :src="user?.avatar || ''" :alt="user?.name" />
                    <AvatarFallback class="rounded-lg">
                      CN
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ user?.name }}</span>
                    <span class="truncate text-xs">{{ user?.num }}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="bottom" align="end" :side-offset="4">
                <DropdownMenuLabel v-if="user" class="p-0 font-normal">
                  <Badge class="ml-auto mr-6 mb-2" variant="secondary">
                    v{{ version }}
                  </Badge>
                  <div class="flex items-center space-x-2 px-1 py-1.5 text-left text-sm">
                    <Avatar class="h-12 w-12 rounded-lg">
                      <AvatarImage :src="user.avatar" :alt="user.name" />
                      <AvatarFallback class="rounded-lg">
                        CN
                      </AvatarFallback>
                    </Avatar>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">{{ user.name }}</span>
                      <span class="truncate text-xs flex items-center">
                        <LucideUser class="w-3 h-3 mr-1" />
                        {{ user.num }}</span>
                      <span class="truncate text-xs flex items-center">
                        <LucidePhone class="w-3 h-3 mr-1" />
                        <span>
                          {{ user.bind_phone }}
                        </span>
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="isBindPhoneOpen = true">
                    <LucidePhone />
                    绑定手机号
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="isResetPasswordOpen = true">
                    <LucideLock />
                    修改密码
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="logout">
                    <LucideLogOut />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <div class="mx-1 hidden">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[minmax(0,.75fr)_minmax(0,1fr)]">
                  <li>
                    <NavigationMenuLink as-child>
                      <a
                        href="/docs/typography"
                        class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div class="text-sm font-medium leading-none">Typography</div>
                        <p class="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Styles for headings, paragraphs, lists...etc
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <header class="flex justify-between h-16 shrink-0 items-center space-x-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center space-x-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <AppBreadcrumb />
        </div>
      </header>
      <div class="px-4 flex-1 overflow-hidden pb-4">
        <slot />
      </div>
    </SidebarInset>

    <Dialog v-model:open="isCreateOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建企业</DialogTitle>
          <DialogDescription>
            填写企业信息以创建企业
          </DialogDescription>
        </DialogHeader>
        <CreateOrgForm @success="() => { refetch(); isCreateOpen = false }" />
        <DialogFooter />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isBindPhoneOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>绑定手机号</DialogTitle>
          <DialogDescription>
            填写信息以绑定新手机号
          </DialogDescription>
        </DialogHeader>
        <form class="space-y-2 p-4 max-md:max-h-[30vh] overflow-scroll" @submit="bindPhone">
          <FormField v-slot="{ componentField }" name="phone">
            <FormItem>
              <FormLabel>电话号码</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="img_verify_code">
            <FormItem>
              <FormLabel>图形验证码</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <VerifyImg ref="verifyImg" class="mt-2" />
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="verify_code">
            <FormItem>
              <FormLabel>短信验证码</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
                <SendSmsButton
                  :opts="{
                    phone: controlledValues.phone || '',
                    verify_code: controlledValues.img_verify_code || '',
                    sms_type: 'bind-phone',
                    country_code: '86',
                  }" @error="onVerifyImgCodeError"
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          </FormField>
          <DialogFooter>
            <Button type="submit" class="w-full">
              提交
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isResetPasswordOpen">
      <DialogTrigger as-child />
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            填写新旧密码以修改
          </DialogDescription>
        </DialogHeader>
        <AutoForm
          class="space-y-2 px-4"
          :schema="resetPasswordSchema" :field-config="{
            old_password: { label: '旧密码' },
            new_password: { label: '新密码' },
          }" @submit="resetPassword"
        >
          <Button type="submit" class="float-right">
            提交
          </Button>
        </AutoForm>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  </SidebarProvider>
</template>

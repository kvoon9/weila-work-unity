<script setup lang="ts">
import type { FileUploader } from '#components'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { toFileWrapper } from '@weila/network'
import { useForm } from 'vee-validate'
import * as z from 'zod'

definePageMeta({
  layout: 'back',
})

appHead.value = '设置认证信息'

const router = useRouter()
const { $v2 } = useNuxtApp()
const {
  serviceLegalQuery: { data, isPending: isServiceLegalPending },
  isVerified,
  hasLicense,
  refetch,
} = useService()

const fileUploaderRef = templateRef<Pick<InstanceType<typeof FileUploader>, 'filelist'>>('fileUploaderRef')
const license = computed(() => fileUploaderRef.value?.filelist[0]?.url)

const { stop } = watchEffect(() => {
  if (fileUploaderRef.value && data.value?.merchant.business_license) {
    fileUploaderRef.value.filelist.push(toFileWrapper(data.value?.merchant.business_license))
    stop()
  }
})

const licenseSchema = z.object({
  businessLicense: z.string().min(1, '请上传营业执照'),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(licenseSchema),
  initialValues: {
    businessLicense: data.value?.merchant.business_license,
  },
})

const [businessLicense, businessLicenseAttrs] = defineField('businessLicense')

watchOnce(data, newValue => businessLicense.value = newValue?.merchant.business_license)

const { mutate: updateLicense, isPending } = useMutation({
  mutationFn: async () => {
    if (hasLicense.value) {
      const body = {
        legal: {
          id: data.value?.id,
          type: 0,
          merchant: {
            business_license: license.value,
          },
        },
      }
      return await $v2('corp/busi/legal/change-legal', {
        body,
      })
    }
    else {
      const body = {
        legal: {
          type: 0,
          merchant: {
            business_license: license.value,
          },
        },
      }
      return await $v2('corp/busi/legal/add-legal', {
        body,
      })
    }
  },
  onSuccess() {
    const { toast } = useToast()
    toast({ title: isVerified.value ? '修改认证信息成功' : '提交认证信息成功' })
    refetch()
    router.push('/workbench')
  },
})

const onSubmit = handleSubmit(() => {
  try {
    updateLicense()
  }
  catch (errmsg) {
    const { toast } = useToast()
    toast({
      title: '操作失败',
      description: String(errmsg),
    })
  }
})
</script>

<template>
  <div p8>
    <form flex flex-col space-y-2 @submit.prevent="onSubmit">
      <label label for="businessLicense">营业执照</label>
      <div v-if="isServiceLegalPending">
        <div class="loader" />
      </div>
      <FileUploader
        v-else
        ref="fileUploaderRef"
        v-bind="businessLicenseAttrs"
        :limit="1"
        classes="w80 h60 border-2 "
        @update:files="([url]) => businessLicense = url"
      />
      <span text-red>{{ errors.businessLicense }}</span>

      <div text-center my8 color-orange>
        <span
          :class="{
            'color-green': data?.state === 8,
            'color-red': data?.state === 9,
          }"
        >

          {{
            adtStateMap[data?.state ?? 0]
          }}
        </span>
      </div>

      <button v-is-loading="isPending" type="submit" btn-primary border-none>
        保存
      </button>
    </form>
  </div>
</template>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

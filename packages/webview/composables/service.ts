import type { DefaultError, UseMutationOptions } from '@tanstack/vue-query'
import type { Reactive } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'
import * as z from 'zod'

export type GetMyBusinessParams = never

export interface GetMyBusinessModel {
  business: {
    id: number
    sid: number
    type: number
    merchant: {
      type: number
      name: string
      avatar: string
      intro: string
      phone: string
      album: string[]
      citycode: string
      adcode: string
      lat: number
      lon: number
      township: string
      address: string
    }
    state: number
  }
}

export const useMyBusiness = createSharedComposable(() => {
  const { $v2 } = useNuxtApp()

  return useQuery({
    queryKey: ['corp-busi-get-my-business'],
    queryFn: () => $v2<GetMyBusinessModel>('corp/busi/get-my-business').then(i => i.business),
  })
})

interface ServiceLegal {
  id: number
  category: number
  type: number
  merchant: {
    business_license: string
  }
  state: 0 | 8 | 9 // 0 ~ 7 待审核 8 成功 9 失败
}

export const useServiceLegal = createSharedComposable(() => {
  const { $v2 } = useNuxtApp()

  const { isLogin } = storeToRefs(useAuthStore())

  return useQuery({
    enabled: isLogin,
    queryKey: ['service-license'],
    queryFn: () => $v2<{
      legal: ServiceLegal
    }>('corp/busi/legal/get-my-legal').then(i => i.legal),
  })
})

export const useService = createSharedComposable(() => {
  const myBusinessQuery = useMyBusiness()
  const serviceLegalQuery = useServiceLegal()

  const hasBusiness = computed(() => !!myBusinessQuery.data.value)
  const hasLicense = computed(() => !!serviceLegalQuery.data.value)
  const isVerified = computed(() => serviceLegalQuery.data.value?.state === 8)

  const serviceState = computed(() => {
    if (hasBusiness.value && isVerified.value)
      return ServiceState.Verified

    if (!hasBusiness.value)
      return ServiceState.Uncreated

    return ServiceState.Unverified
  })

  const isPending = computed(() => {
    return myBusinessQuery.isPending.value || serviceLegalQuery.isPending.value
  })

  const isSuccess = computed(() => {
    return myBusinessQuery.isSuccess.value && serviceLegalQuery.isSuccess.value
  })

  const data = computed(() => {
    return {
      business: myBusinessQuery.data.value,
      legal: serviceLegalQuery.data.value,
    }
  })

  return {
    hasBusiness,
    hasLicense,
    isVerified,
    serviceState,
    myBusinessQuery,
    serviceLegalQuery,
    refetch: () => {
      myBusinessQuery.refetch()
      serviceLegalQuery.refetch()
    },
    data,
    isPending,
    isSuccess,
  }
})

export interface ChangeBusinessPayload {
  business: {
    id: number
    merchant: {
      type: number
      name: string
      avatar: string
      intro: string
      phone: string
      album: string[]
      citycode: string
      adcode: string
      lat: number
      lon: number
      township: string
      address: string
    }
  }
}

export type ChangeBusinessModel = never

export const useMutateBusiness = createSharedComposable(() => {
  const { $v2 } = useNuxtApp()

  return useMutation<ChangeBusinessModel, DefaultError, ChangeBusinessPayload>({
    mutationFn: body => $v2<ChangeBusinessModel>('corp/busi/change-business', { body }),
  })
})

export interface GetBusinessPointListPayload {
  sid: number
}

export interface GetBusinessPointListModel {
  points: {
    id: number
    sid: number
    name: string
    avatar: string
    intro: string
    phone: string
    album: string[]
    adcode: string
    lat: number
    lon: number
    address: string
    staff_count: number
  }[]
}

export const useBusinessPointList = createSharedComposable((payload: Reactive<GetBusinessPointListPayload>) => {
  const { $v2 } = useNuxtApp()

  const query = useQuery({
    queryKey: ['corp-busi-get-business-point-list', payload],
    queryFn: () => $v2<GetBusinessPointListModel>('corp/busi/get-business-point-list', { body: payload }),
  })

  return query
})

export const useBusinessPoint = createSharedComposable((sid: number, pid: number) => {
  const query = useBusinessPointList({ sid })

  return {
    ...query,
    data: computed(() => query.data.value?.points.find(i => i.id === pid)),
  }
})

export const changeBusinessPointSchema = z.object({
  id: z.number().optional(),
  name: z.string().max(50, '名称最长50个字符'),
  phone: z.string().length(11, '手机号必须为11位'),
  avatar: z.string().default('').optional(),
  intro: z.string().max(200, '简介最长200个字符').default('').optional(),
  album: z.array(z.string()).default([]).optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  adcode: z.string().optional(),
  address: z.string().optional(),
})

export type ChangeBusinessPointPayload = z.infer<typeof changeBusinessPointSchema>
export type ChangeBusinessPointModel = never

export const changeBusinessPoint = createSharedComposable(() => {
  const { $v2 } = useNuxtApp()

  return useMutation<ChangeBusinessPointModel, DefaultError, ChangeBusinessPointPayload>({
    mutationFn: payload => $v2<ChangeBusinessPointModel>('corp/busi/change-business-point', { body: { point: payload } }),
  })
})

export const delBusinessPointSchema = z.object({
  pid: z.number(),
})

export type DelBusinessPoint = z.infer<typeof delBusinessPointSchema>

export type DelBusinessPointModel = never

export const delBusinessPoint = createSharedComposable(() => {
  const { $v2 } = useNuxtApp()

  return useMutation<DelBusinessPoint, DefaultError, DelBusinessPoint>({
    mutationFn: payload => $v2<DelBusinessPointModel>('corp/busi/del-business-point', { body: payload }),
  })
})

export const createBusinessPointSchema = z.object({
  sid: z.number().optional(),
  name: z.string().max(50, '名称最长50个字符'),
  phone: z.string().length(11, '手机号必须为11位'),
  avatar: z.string().default('').optional(),
  intro: z.string().max(200, '简介最长200个字符').default('').optional(),
  album: z.array(z.string()).default([
    'http://download.weila.hk/tmp/2025-03-28/1743147275_8551e1fd.png',
  ]).optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  adcode: z.string().optional(),
  address: z.string().optional(),
})

export type CreateBusinessPointPayload = z.infer<typeof createBusinessPointSchema>

export type CreateBusinessPointModel = never

export const createBusinessPoint = createSharedComposable(() => {
  const { $v2 } = useNuxtApp()

  return useMutation<CreateBusinessPointPayload, DefaultError, CreateBusinessPointPayload>({
    mutationFn: payload => $v2<CreateBusinessPointModel>('corp/busi/create-business-point', { body: { point: payload } }),
  })
})

export const addBusinessStaffsSchema = z.object({
  sid: z.number(),
  uids: z.array(z.number()),
})

export type AddBusinessStaffs = z.infer<typeof addBusinessStaffsSchema>

export type AddBusinessStaffsModel = never

export const useAddBusinessStaffs = createSharedComposable((options?: UseMutationOptions<AddBusinessStaffs, DefaultError, AddBusinessStaffs>) => {
  const { $v2 } = useNuxtApp()

  return useMutation<AddBusinessStaffs, DefaultError, AddBusinessStaffs>({
    mutationFn: payload => $v2<AddBusinessStaffsModel>('corp/busi/add-business-staffs', { body: payload }),
    ...options,
  })
})

export interface GetBusinessStaffListPayload {
  sid: number
}

export interface GetBusinessStaffListModel {
  staffs: {
    uid: number
    num: string
    job_num: string
    sex: number
    name: string
    avatar: string
    state: number
  }[]
}

export const useBusinessStaffList = createSharedComposable((body: Reactive<GetBusinessStaffListPayload>) => {
  const { $v2 } = useNuxtApp()

  return useQuery({
    queryKey: ['corp/busi/get-business-staff-list', body],
    queryFn: () => $v2<GetBusinessStaffListModel>('corp/busi/get-business-staff-list', { body }).then(i => i.staffs),
  })
})

export const delBusinessStaffSchema = z.object({
  sid: z.number(),
  uid: z.number(),
})

export type DelBusinessStaffPayload = z.infer<typeof delBusinessStaffSchema>
export type DelBusinessStaffModel = never

export const useDelBusinessStaff = createSharedComposable((options?: UseMutationOptions<DelBusinessStaffPayload, DefaultError, DelBusinessStaffPayload>) => {
  const { $v2 } = useNuxtApp()

  return useMutation<DelBusinessStaffPayload, DefaultError, DelBusinessStaffPayload>({
    mutationFn: body => $v2<DelBusinessStaffModel>('corp/busi/del-business-staff', { body }),
    ...options,
  })
})

export interface GetBusinessPointStaffListPayload {
  pid: number
}

export interface Staff {
  uid: number
  num: string
  job_num: string
  sex: number
  name: string
  avatar: string
  state: number
  type: number
}

export interface GetBusinessPointStaffListModel {
  staffs: Staff[]
}

export const useGetBusinessPointStaffList = createSharedComposable((body: Reactive<GetBusinessPointStaffListPayload>) => {
  const { $v2 } = useNuxtApp()

  return useQuery({
    queryKey: ['corp-busi-get-business-point-staff-list', body],
    queryFn: () => $v2<GetBusinessPointStaffListModel>('corp/busi/get-business-point-staff-list', { body }).then(i => i.staffs),
  })
})

export interface AddBusinessPointStaffsPayload {
  pid: number
  uids: number[]
}

export type AddBusinessPointStaffsModel = never

export const useAddBusinessPointStaffs = createSharedComposable((options?: UseMutationOptions<AddBusinessPointStaffsPayload, DefaultError, AddBusinessPointStaffsPayload>) => {
  const { $v2 } = useNuxtApp()

  return useMutation<AddBusinessPointStaffsPayload, DefaultError, AddBusinessPointStaffsPayload>({
    mutationFn: body => $v2<AddBusinessPointStaffsModel>('corp/busi/add-business-point-staffs', { body }),
    ...options,
  })
})

export interface DelBusinessPointStaffPayload {
  pid: number
  uid: number
}

export type DelBusinessPointStaffModel = never

export const useDelBusinessPointStaff = createSharedComposable((options?: UseMutationOptions<DelBusinessPointStaffPayload, DefaultError, DelBusinessPointStaffPayload>) => {
  const { $v2 } = useNuxtApp()

  return useMutation<DelBusinessPointStaffPayload, DefaultError, DelBusinessPointStaffPayload>({
    mutationFn: body => $v2<DelBusinessPointStaffModel>('corp/busi/del-business-point-staff', { body }),
    ...options,
  })
})

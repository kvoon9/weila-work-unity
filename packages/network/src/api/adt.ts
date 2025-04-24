import type { DefaultError, UseMutationOptions } from '@tanstack/vue-query'
import type { $Fetch } from 'ofetch'
import type { Reactive } from 'vue'
import { useMutation, useQuery } from '@tanstack/vue-query'

export const adtStateMap = {
  0: '待审核',
  8: '审核通过',
  9: '审核未通过',
}

export interface GetLegalListPayload {
  state?: number
}

export interface GetLegalListModel {
  legals: {
    id: number
    category: number
    type: number
    merchant: {
      business_license: string
    }
    state: keyof typeof adtStateMap
  }[]
}

export function useGetLegalList($v2: $Fetch, body: Reactive<GetLegalListPayload>) {
  return useQuery({
    queryKey: ['life-adt-get-legal-list', body],
    queryFn: () => $v2<GetLegalListModel>('life/adt/get-legal-list', { body }),
  })
}

export interface AuditLegalPayload {
  id: number
  state: number
  reason?: string
}

export interface LegalMerchant {
  business_license: string
}

export interface AuditLegalModel {
  legal: {
    id: number
    category: number
    type: number
    merchant: LegalMerchant
    state: number
    reason: string
  }
}

export function useAuditLegal($v2: $Fetch, options?: UseMutationOptions<AuditLegalModel, DefaultError, AuditLegalPayload>) {
  return useMutation<AuditLegalModel, DefaultError, AuditLegalPayload>({
    mutationFn: body => $v2<AuditLegalModel>('life/adt/audit-legal', { body }),
    ...options,
  })
}

import { useQuery } from '@tanstack/vue-query'

export interface GetBusinessPointListParams {
  sid: number
}

export interface Point {
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
}

export interface GetBusinessPointListModel {
  points: Point[]
}

export function useGetBusinessPointList(params: GetBusinessPointListParams) {
  const { $v2 } = useNuxtApp()

  return useQuery({
    queryKey: ['corp-busi-get-business-point-list', params],
    queryFn: () => $v2<GetBusinessPointListModel>('corp/busi/get-business-point-list', { params }),
  })
}

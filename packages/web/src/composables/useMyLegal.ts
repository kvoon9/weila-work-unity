export function useMyLegal() {
  return useWeilaFetch<Legal>('corp/legal/get-legal')
}

export interface Legal {
  id: number;
  org_num: number;
  category: number;
  name: string;
  identify: string;
  identify_card_front: string
  identify_card_reverse: string
  business_license: string;
  state: number;
  updated: string;
}

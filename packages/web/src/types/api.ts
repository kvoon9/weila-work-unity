export interface Legal {
  id: number
  org_num: number
  category: number
  name: string
  identify: string
  identify_card_front: string
  identify_card_reverse: string
  business_license: string
  state: number
  updated: string
}

export interface UserLegal {
  id?: number
  org_num?: number
  category: 1
  name?: string
  identify?: string
  identify_card_front?: string
  identify_card_reverse?: string
  business_license?: string
  state?: number
  updated?: string
}

export interface CorpLegal {
  id?: number
  org_num?: number
  category: 0
  name?: string
  identify?: string
  identify_card_front?: string
  identify_card_reverse?: string
  business_license?: string
  state?: number
  updated?: string
}

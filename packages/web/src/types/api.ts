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
  reason?: string
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

export interface Member {
  user_id: number
  user_num: string
  job_num: string
  sex: number
  name: string
  avatar: string
  is_admin: number
  dept_id: number
  phone: string
  country_code: string
  state: number
  type: number
  tts: number
  loc_share: number
  track: number
  group_count: number
  created: number
  grp_cnt: number
  grp_lmt: number
}

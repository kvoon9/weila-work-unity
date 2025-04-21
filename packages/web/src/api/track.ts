export interface UserTrackModel {
  longitude: number
  latitude: number
  created: number
}

export interface RegeoModel {
  province: string
  city: string
  district: string
  township: string
  road: string
  number: string
  addr: string
  name: string
  adcode: string
  matchs: {
    aoi_name: string
    aoi_distance: number
    poi_name: string
    poi_distance: string
    roadinter_name: string
    roadinter_distance: string
  }
  formatted_address: string
}

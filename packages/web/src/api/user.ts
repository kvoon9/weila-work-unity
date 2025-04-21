import type { RouteRecordNormalized } from 'vue-router'
import axios from 'axios'

export function getMenuList() {
  return axios.post<RouteRecordNormalized[]>('/api/user/menu')
}

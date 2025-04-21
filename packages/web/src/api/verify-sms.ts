import { weilaRequest } from './instances/request'

export interface SendVerifySmsModel {
  phone: string
  country_code: '86'
  sms_type: 'regist' | 'bind-phone' | 'reset-password' | 'add-device'
  verify_code: string
}

export async function sendVerifySms(params: SendVerifySmsModel) {
  return await weilaRequest.post('/corp/web/send-sms-verifycode', params)
}

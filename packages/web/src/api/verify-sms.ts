export interface SendVerifySmsModel {
  phone: string
  country_code: '86'
  sms_type: 'regist' | 'bind-phone' | 'reset-password' | 'add-device'
  verify_code: string
}

export async function sendVerifySms(params: SendVerifySmsModel) {
  return await $weilaPublicRequest.post('/corp/web/send-sms-verifycode', params)
}

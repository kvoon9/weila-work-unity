export interface SendVerifySmsModel {
  phone: string
  countrycode: '86'
  smstype: 'work-regist'
  // smstype: 'regist' | 'bind-phone' | 'reset-password' | 'add-device'
  verify_id: string
  verify_answer: string
}

export async function sendVerifySms(body: SendVerifySmsModel) {
  const weilaApi = useWeilaApi()
  return await weilaApi.value.v2.fetch('/corp/web/send-sms-verifycode', { body })
}

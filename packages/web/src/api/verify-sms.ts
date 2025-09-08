export interface SendVerifySmsBody {
  phone: string
  countrycode: string
  verify_id: string
  verify_answer: string
  smstype: 'work-login' | 'work-regist' | 'work-bind-phone' | 'work-reset-password' | 'work-add-device' | 'work-unregist'
}

export async function sendVerifySms(body: SendVerifySmsBody) {
  const weilaApi = useWeilaApi()
  return await weilaApi.value.v2.fetch('/corp/web/send-sms-verifycode', { body })
}

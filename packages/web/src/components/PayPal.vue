<script setup lang="ts">
import { sleep } from '@antfu/utils'
import Message from '@arco-design/web-vue/es/message'
import { loadScript } from '@paypal/paypal-js'

const { t } = useI18n()

onMounted(async () => {
  const paypal = await loadScript({
    clientId: 'test',
    currency: 'USD',
  })

  // Render the PayPal button into #paypal-button-container
  paypal?.Buttons?.({
    style: {
      layout: 'horizontal',
    },

    async createSubscription(data, actions) {
      await sleep(3000) // api: create order
      return actions.subscription.create({
        plan_id: '1',
      })
    },

    async onApprove(data, actions) {
      // Three cases to handle:
      //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
      //   (2) Other non-recoverable errors -> Show a failure message
      //   (3) Successful transaction -> Show confirmation or thank you
      await sleep(3000) // api: capture payment, `/demo/checkout/api/paypal/order/${data.orderID}/capture/`

      Message.success(t('message.payment.success'))
    },
  }).render('#paypal-button-container')
})
</script>

<template>
  <div>
    <label>
      <input type="radio" name="payment-option" value="paypal" checked>
      <!-- <img src="/demo/checkout/static/img/paypal-mark.jpg" alt="Pay with Paypal"> -->
    </label>

    <label>
      <input type="radio" name="payment-option" value="card">
      <!-- <img src="/demo/checkout/static/img/card-mark.png" alt="Accepting Visa, Mastercard, Discover and American Express"> -->
    </label>

    <div id="paypal-button-container" />
    <div id="card-button-container">
      <button>Continue</button>
    </div>
  </div>
</template>

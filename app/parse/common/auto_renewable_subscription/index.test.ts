import { parseSubscriptions } from "."
import { AppleVerifyReceiptResponseBodySuccess } from "types-apple-iap"

describe("parseSubscriptions", () => {
  it(`given no latest receipt info, expect empty`, async () => {
    const response: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/simple.json")

    expect(parseSubscriptions(response.latest_receipt_info, response.pending_renewal_info)).toEqual([])
  })
  it(`given subscription transactions, expect get parsed subscription responses`, async () => {
    const response: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/subscription_first_time_purchase.json")
    const actual = parseSubscriptions(response.latest_receipt_info, response.pending_renewal_info)

    expect(actual).toHaveLength(1)
    expect(actual[0].allTransactions).toHaveLength(3)
  })
  it(`given downgrades, expect subscription maps to pending renewal info correctly`, async () => {
    const response: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/subscription_multiple_subscription_purchases.json")
    const actual = parseSubscriptions(response.latest_receipt_info, response.pending_renewal_info)

    expect(actual).toHaveLength(1)
    expect(actual[0].currentProductId).toEqual("test_sub2")
    expect(actual[0].willAutoRenew).toEqual(true)
  })
  it(`given cannot find pending renewal info, expect no errors`, async () => {
    const response: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/subscription_multiple_subscription_purchases.json")
    delete response.pending_renewal_info
    const actual = parseSubscriptions(response.latest_receipt_info, response.pending_renewal_info)

    expect(actual).toHaveLength(1)
  })
})
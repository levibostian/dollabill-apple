import { AppleVerifyReceiptSuccessfulResponse } from "../../apple_response"
import { parseSubscriptions } from "."

describe("parseSubscriptions", () => {
  it(`given no latest receipt info, expect empty`, async () => {
    expect(parseSubscriptions(require("../../../../samples/simple.json"))).toEqual([])
  })
  it(`given subscription transactions, expect get parsed subscription responses`, async () => {
    const actual = parseSubscriptions(require("../../../../samples/subscription_first_time_purchase.json"))

    expect(actual).toHaveLength(1)
    expect(actual[0].allTransactions).toHaveLength(3)
  })
  it(`given upgrade/downgrades, expect subscription maps to pending renewal info correctly`, async () => {
    const actual = parseSubscriptions(require("../../../../samples/subscription_multiple_subscription_purchases.json"))

    expect(actual).toHaveLength(1)
    expect(actual[0].currentProductId).toEqual("test_sub2")
    expect(actual[0].willAutoRenew).toEqual(true)
  })
  it(`given cannot find pending renewal info, expect no errors`, async () => {
    const response: AppleVerifyReceiptSuccessfulResponse = require("../../../../samples/subscription_multiple_subscription_purchases.json")
    delete response.pending_renewal_info
    const actual = parseSubscriptions(response)

    expect(actual).toHaveLength(1)
  })
})
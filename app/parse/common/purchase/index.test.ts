import { parsePurchases } from "."
import { AppleVerifyReceiptResponseBodySuccess } from "types-apple-iap"

describe("parsePurchases", () => {
  it(`given no in app purchases`, async () => {
    const sample: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/simple.json")
    expect(parsePurchases(sample.latest_receipt_info, sample.receipt.in_app)).toEqual([])
  })
  it(`given purchase transactions, expect get parsed purchase responses`, async () => {
    const sample: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/bought_consumable.json")
    const actual = parsePurchases(sample.latest_receipt_info, sample.receipt.in_app)

    expect(actual).toHaveLength(1)
    expect(actual[0].transactions).toHaveLength(1)
    expect(actual[0].productId).toEqual("test_consumable")
  })
  it(`given purchase transactions located in latest receipt info, expect get transaction`, async () => {
    const sample: AppleVerifyReceiptResponseBodySuccess = require("../../../../samples/consumable_in_latest_receipt_info.json")
    const actual = parsePurchases(sample.latest_receipt_info, sample.receipt.in_app)

    expect(actual).toHaveLength(1)
    expect(actual[0].transactions).toHaveLength(1)
    expect(actual[0].productId).toEqual("nonconsumable_test")
  })
})

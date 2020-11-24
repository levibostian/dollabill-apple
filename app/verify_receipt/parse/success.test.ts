import { parseSuccess } from "./success"

describe("parseSuccess", () => {
  it(`given receipt with no purchases, expect result`, async () => {
    const actual = parseSuccess(require("../../../samples/simple.json"))

    expect(actual.autoRenewableSubscriptions).toEqual([])
    expect(actual.productPurchases).toEqual([])
  })
})
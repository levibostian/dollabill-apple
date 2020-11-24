import { parsePurchases } from "."

describe("parsePurchases", () => {
  it(`given no in app purchases`, async () => {
    expect(parsePurchases(require("../../../../samples/simple.json"))).toEqual([])
  })
  it(`given subscription transactions, expect get parsed subscription responses`, async () => {
    const actual = parsePurchases(require("../../../../samples/bought_consumable.json"))

    expect(actual).toHaveLength(1)
    expect(actual[0].transactions).toHaveLength(1)
    expect(actual[0].productId).toEqual("test_consumable")
  })
})

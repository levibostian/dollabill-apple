import { AppleInAppPurchaseTransaction } from "types-apple-iap"
import { ParsedPurchases } from "./transaction"

/* eslint-disable no-var */
var parsedPurchases: ParsedPurchases
var givenPurchase: AppleInAppPurchaseTransaction
var givenPurchase2: AppleInAppPurchaseTransaction
/* eslint-enable no-var */

beforeEach(() => {
  parsedPurchases = new ParsedPurchases()
  givenPurchase = Object.assign({}, require("../../../../samples/consumable.json"))
  givenPurchase2 = Object.assign({}, require("../../../../samples/consumable2.json"))
})

describe("ParsedPurchases", () => {
  describe("isPurchaseTransaction", () => {
    it(`given purchase without expires date, expect true`, async () => {
      expect(
        ParsedPurchases.isPurchaseTransaction({
          expires_date: undefined
        } as AppleInAppPurchaseTransaction)
      ).toEqual(true)
    })
    it(`given purchase with expires, expect false`, async () => {
      expect(
        ParsedPurchases.isPurchaseTransaction({
          expires_date: "2020-11-10"
        } as AppleInAppPurchaseTransaction)
      ).toEqual(false)
    })
  })

  describe("addTransaction", () => {
    it(`given transaction that's not a purchase, expect throw`, async () => {
      expect(() => {
        parsedPurchases.addTransaction({
          expires_date: "2020-11-10"
        } as AppleInAppPurchaseTransaction)
      }).toThrowErrorMatchingInlineSnapshot(
        `"BUG! Please, file a bug report: https://github.com/levibostian/dollabill-apple/issues/new?template=BUG_REPORT.md. (Filter out all transactions that are *not* product purchase transactions before calling this function.)"`
      )
    })
    it(`given add transactions from multiple purchases, expect grouped by product`, async () => {
      parsedPurchases.addTransaction(givenPurchase)
      parsedPurchases.addTransaction(givenPurchase2)

      expect(Array.from(parsedPurchases.transactions.keys())).toHaveLength(2)
      expect(parsedPurchases.transactions.get(givenPurchase.product_id)).not.toEqual(
        parsedPurchases.transactions.get(givenPurchase2.product_id)
      )
    })
    it(`given add multiple transactions for same subscription, expect add transactions`, async () => {
      parsedPurchases.addTransaction(givenPurchase)
      givenPurchase.transaction_id = "unique_id"
      parsedPurchases.addTransaction(givenPurchase)

      expect(Array.from(parsedPurchases.transactions.keys())).toHaveLength(1)
      expect(parsedPurchases.transactions.get(givenPurchase.product_id)).toHaveLength(2)
    })
    it(`given duplicate transactions, expect do not  add  duplicate`, async () => {
      givenPurchase.transaction_id = "not_unique_id"
      parsedPurchases.addTransaction(givenPurchase)
      givenPurchase.transaction_id = "not_unique_id"
      parsedPurchases.addTransaction(givenPurchase)

      expect(Array.from(parsedPurchases.transactions.keys())).toHaveLength(1)
      expect(parsedPurchases.transactions.get(givenPurchase.product_id)).toHaveLength(1)
    })
    it(`given purchase, expect parsed transaction`, async () => {
      parsedPurchases.addTransaction(givenPurchase)

      expect(parsedPurchases.transactions.get(givenPurchase.product_id)![0]).toMatchInlineSnapshot(`
        Object {
          "purchaseDate": 2020-11-13T01:41:41.000Z,
          "quantity": 1,
          "rawTransaction": Object {
            "is_trial_period": "false",
            "original_purchase_date": "2020-11-13 01:41:41 Etc/GMT",
            "original_purchase_date_ms": "1605231701000",
            "original_purchase_date_pst": "2020-11-12 17:41:41 America/Los_Angeles",
            "original_transaction_id": "1000000741427785",
            "product_id": "test_consumable",
            "purchase_date": "2020-11-13 01:41:41 Etc/GMT",
            "purchase_date_ms": "1605231701000",
            "purchase_date_pst": "2020-11-12 17:41:41 America/Los_Angeles",
            "quantity": "1",
            "transaction_id": "1000000741427785",
          },
          "transactionId": "1000000741427785",
        }
      `)
    })
  })

  describe("parse", () => {
    it(`given multiple purchases, expect sort by purchase date`, async () => {
      parsedPurchases.addTransaction(givenPurchase)
      givenPurchase2.product_id = givenPurchase.product_id // to make these 2 transactions be grouped together
      parsedPurchases.addTransaction(givenPurchase2)

      const actual = parsedPurchases.parse()

      expect(actual).toHaveLength(1)
      expect(givenPurchase.transaction_id).not.toEqual(givenPurchase2.transaction_id) // to assert these next lines mean something.
      expect(actual[0].transactions[0].transactionId).toEqual(givenPurchase.transaction_id)
      expect(actual[0].transactions[1].transactionId).toEqual(givenPurchase2.transaction_id)
    })
    it(`given purchases, expect result`, async () => {
      parsedPurchases.addTransaction(givenPurchase)

      const actual = parsedPurchases.parse()

      expect(actual).toMatchInlineSnapshot(`
        Array [
          Object {
            "productId": "test_consumable",
            "transactions": Array [
              Object {
                "purchaseDate": 2020-11-13T01:41:41.000Z,
                "quantity": 1,
                "rawTransaction": Object {
                  "is_trial_period": "false",
                  "original_purchase_date": "2020-11-13 01:41:41 Etc/GMT",
                  "original_purchase_date_ms": "1605231701000",
                  "original_purchase_date_pst": "2020-11-12 17:41:41 America/Los_Angeles",
                  "original_transaction_id": "1000000741427785",
                  "product_id": "test_consumable",
                  "purchase_date": "2020-11-13 01:41:41 Etc/GMT",
                  "purchase_date_ms": "1605231701000",
                  "purchase_date_pst": "2020-11-12 17:41:41 America/Los_Angeles",
                  "quantity": "1",
                  "transaction_id": "1000000741427785",
                },
                "transactionId": "1000000741427785",
              },
            ],
          },
        ]
      `)
    })
  })
})

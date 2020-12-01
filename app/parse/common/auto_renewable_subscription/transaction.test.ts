import { AppleLatestReceiptInfo } from "types-apple-iap"
import { ParsedTransactions } from "./transactions"

let parsedTransactions: ParsedTransactions
let givenSubscription: AppleLatestReceiptInfo
let givenSubscription2: AppleLatestReceiptInfo
const givenProductPurchase = require("../../../../samples/consumable.json")
const exampleDateMsString = "1605230970000"

beforeEach(() => {
  parsedTransactions = new ParsedTransactions()
  givenSubscription = require("../../../../samples/autorenewable_subscription.json")
  givenSubscription2 = require("../../../../samples/autorenewable_subscription2.json")
})

describe("ParsedTransactions", () => {
  describe("addTransaction", () => {
    it(`given a transaction that's not an auto-renewable subscription, expect throw error`, async () => {
      expect(() => {
        parsedTransactions.addTransaction(givenProductPurchase)
      }).toThrowErrorMatchingInlineSnapshot(
        `"BUG! Please, file a bug report: https://github.com/levibostian/dollabill-apple/issues/new?template=BUG_REPORT.md. (Filter out all transactions that are *not* subscription transactions before calling this function.)"`
      )
    })
    it(`given add transactions from multiple subscriptions, expect grouped by subscription`, async () => {
      parsedTransactions.addTransaction(givenSubscription)
      parsedTransactions.addTransaction(givenSubscription2)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)).not.toEqual(
        parsedTransactions.getParsedTransactions(givenSubscription2)
      )
    })
    it(`given add multiple transactions for same subscription, expect add transactions`, async () => {
      parsedTransactions.addTransaction(givenSubscription)
      parsedTransactions.addTransaction(givenSubscription)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)).toHaveLength(2)
    })
  })
  describe("isAutoRenewableSubscriptionTransaction", () => {
    it(`given auto-renewable subscription, expect true`, async () => {
      expect(ParsedTransactions.isAutoRenewableSubscriptionTransaction(givenSubscription)).toEqual(
        true
      )
    })
    it(`given product purchase, expect false`, async () => {
      expect(
        ParsedTransactions.isAutoRenewableSubscriptionTransaction(givenProductPurchase)
      ).toEqual(false)
    })
  })
  describe("updateIsEligibleIntroductoryOffer", () => {
    // Tests that if we find it's not eligible, we never overwrite that value
    it(`given transaction in trial period and a later transaction not in trial period, expect false`, async () => {
      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "true"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(false)

      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(false)
    })
    it(`given multiple transactions not in trial period or intro offer, expect true`, async () => {
      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(true)

      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(true)
    })
    it(`given transactions from same subscription groups not eligible, expect false`, async () => {
      givenSubscription.is_in_intro_offer_period = "true"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)

      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)

      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(false)
    })
    it(`given transactions from separate subscription groups, expect different unique results`, async () => {
      givenSubscription.is_in_intro_offer_period = "true"
      givenSubscription.is_trial_period = "false"
      givenSubscription.subscription_group_identifier = "1"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(false)

      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      givenSubscription.subscription_group_identifier = "2"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(true)
    })
    it(`given transaction, expect populate first result`, async () => {
      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(true)
    })
    it(`given second transaction, expect update with new result`, async () => {
      givenSubscription.is_in_intro_offer_period = "false"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(true)

      givenSubscription.is_in_intro_offer_period = "true"
      givenSubscription.is_trial_period = "false"
      parsedTransactions.updateIsEligibleIntroductoryOffer(givenSubscription)
      expect(parsedTransactions.getIsEligibleIntroductoryOffer(givenSubscription)).toEqual(false)
    })
  })
  describe("refundReason", () => {
    it(`given refunded transaction for upgrade, expect get upgrade refund reason`, async () => {
      givenSubscription.cancellation_date_ms = exampleDateMsString
      givenSubscription.is_upgraded = "true"

      expect(parsedTransactions.refundReason(givenSubscription)).toEqual("upgrade")
    })
    it(`given refunded transaction for app issue, expect get refund reason`, async () => {
      givenSubscription.cancellation_date_ms = exampleDateMsString
      givenSubscription.is_upgraded = undefined
      givenSubscription.cancellation_reason = "1"

      expect(parsedTransactions.refundReason(givenSubscription)).toEqual("app_issue")
    })
    it(`given refunded transaction for other reason, expect get refund reason`, async () => {
      givenSubscription.cancellation_date_ms = exampleDateMsString
      givenSubscription.is_upgraded = undefined
      givenSubscription.cancellation_reason = "0"

      expect(parsedTransactions.refundReason(givenSubscription)).toEqual("other")
    })
    it(`given not refunded transaction, expect no refund date`, async () => {
      givenSubscription.cancellation_date_ms = undefined

      expect(parsedTransactions.refundReason(givenSubscription)).toBeUndefined()
    })
  })
  describe("isRenewOrRestore", () => {
    it(`given matching transaction ids, expect false`, async () => {
      givenSubscription.original_transaction_id = "123"
      givenSubscription.transaction_id = "123"

      expect(parsedTransactions.isRenewOrRestore(givenSubscription)).toEqual(false)
    })
    it(`given different transaction ids, expect true`, async () => {
      givenSubscription.original_transaction_id = "123"
      givenSubscription.transaction_id = "456"

      expect(parsedTransactions.isRenewOrRestore(givenSubscription)).toEqual(true)
    })
  })
  describe("parseTransaction", () => {
    it(`given transaction, expect all dates to be successfully parsed`, async () => {
      givenSubscription.cancellation_date_ms = exampleDateMsString
      givenSubscription.expires_date_ms = exampleDateMsString
      givenSubscription.original_purchase_date_ms = exampleDateMsString
      givenSubscription.purchase_date_ms = exampleDateMsString

      parsedTransactions.addTransaction(givenSubscription)

      const actual = parsedTransactions.getParsedTransactions(givenSubscription)![0]

      expect(actual.cancelledDate).toBeDefined()
      expect(actual.expiresDate).toBeDefined()
      expect(actual.originalPurchaseDate).toBeDefined()
      expect(actual.purchaseDate).toBeDefined()
    })
    it(`given in intro offer period, expect true`, async () => {
      givenSubscription.is_in_intro_offer_period = "true"

      parsedTransactions.addTransaction(givenSubscription)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)![0].inIntroPeriod).toEqual(
        true
      )
    })
    it(`given no intro offer period, expect undefined`, async () => {
      givenSubscription.is_in_intro_offer_period = "false"

      parsedTransactions.addTransaction(givenSubscription)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)![0].inIntroPeriod).toEqual(
        false
      )
    })
    it(`given in trial period, expect true`, async () => {
      givenSubscription.is_trial_period = "true"

      parsedTransactions.addTransaction(givenSubscription)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)![0].inTrialPeriod).toEqual(
        true
      )
    })
    it(`given is upgraded, expect true`, async () => {
      givenSubscription.is_trial_period = "false"

      parsedTransactions.addTransaction(givenSubscription)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)![0].inTrialPeriod).toEqual(
        false
      )
    })
    it(`given offer code, expect get code`, async () => {
      givenSubscription.offer_code_ref_name = "offer-code-foo"

      parsedTransactions.addTransaction(givenSubscription)

      expect(
        parsedTransactions.getParsedTransactions(givenSubscription)![0].offerCodeRefName
      ).toEqual("offer-code-foo")
    })
    it(`given not offer code, expect undefined`, async () => {
      givenSubscription.offer_code_ref_name = undefined

      parsedTransactions.addTransaction(givenSubscription)

      expect(
        parsedTransactions.getParsedTransactions(givenSubscription)![0].offerCodeRefName
      ).toBeUndefined()
    })
    it(`given subscriptionGroupId, expect get in result`, async () => {
      givenSubscription.subscription_group_identifier = "foo"

      parsedTransactions.addTransaction(givenSubscription)

      expect(
        parsedTransactions.getParsedTransactions(givenSubscription)![0].subscriptionGroupId
      ).toEqual("foo")
    })
    it(`given transactionId, expect get in result`, async () => {
      givenSubscription.transaction_id = "bar"

      parsedTransactions.addTransaction(givenSubscription)

      expect(parsedTransactions.getParsedTransactions(givenSubscription)![0].transactionId).toEqual(
        "bar"
      )
    })
    it(`given webOrderLineItemId, expect get in result`, async () => {
      givenSubscription.web_order_line_item_id = "bar"

      parsedTransactions.addTransaction(givenSubscription)

      expect(
        parsedTransactions.getParsedTransactions(givenSubscription)![0].webOrderLineItemId
      ).toEqual("bar")
    })
    it(`given originalTransactionId, expect get in result`, async () => {
      givenSubscription.original_transaction_id = "bar"

      parsedTransactions.addTransaction(givenSubscription)

      expect(
        parsedTransactions.getParsedTransactions(givenSubscription)![0].originalTransactionId
      ).toEqual("bar")
    })
    it(`given transaction, expect parse`, async () => {
      expect(parsedTransactions.parseTransaction(givenSubscription)).toMatchInlineSnapshot(`
        Object {
          "cancelledDate": 2020-11-13T01:29:30.000Z,
          "expiresDate": 2020-11-13T01:29:30.000Z,
          "inIntroPeriod": false,
          "inTrialPeriod": false,
          "isFirstSubscriptionPurchase": true,
          "isRenewOrRestore": false,
          "isUpgradeTransaction": false,
          "offerCodeRefName": undefined,
          "originalPurchaseDate": 2020-11-13T01:29:30.000Z,
          "originalTransactionId": "bar",
          "productId": "test_subscription",
          "promotionalOfferId": undefined,
          "purchaseDate": 2020-11-13T01:29:30.000Z,
          "rawTransaction": Object {
            "cancellation_date_ms": "1605230970000",
            "cancellation_reason": "0",
            "expires_date": "2020-11-13 01:12:23 Etc/GMT",
            "expires_date_ms": "1605230970000",
            "expires_date_pst": "2020-11-12 17:12:23 America/Los_Angeles",
            "is_in_intro_offer_period": "false",
            "is_trial_period": "false",
            "is_upgraded": undefined,
            "offer_code_ref_name": undefined,
            "original_purchase_date": "2020-11-13 01:09:24 Etc/GMT",
            "original_purchase_date_ms": "1605230970000",
            "original_purchase_date_pst": "2020-11-12 17:09:24 America/Los_Angeles",
            "original_transaction_id": "bar",
            "product_id": "test_subscription",
            "purchase_date": "2020-11-13 01:09:23 Etc/GMT",
            "purchase_date_ms": "1605230970000",
            "purchase_date_pst": "2020-11-12 17:09:23 America/Los_Angeles",
            "quantity": "1",
            "subscription_group_identifier": "foo",
            "transaction_id": "bar",
            "web_order_line_item_id": "bar",
          },
          "refundReason": "other",
          "subscriptionGroupId": "foo",
          "transactionId": "bar",
          "webOrderLineItemId": "bar",
        }
      `)
    })
  })
})

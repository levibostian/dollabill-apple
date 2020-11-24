import { ApplePendingRenewalInfo } from "../../apple_response"
import { ParsedSubscription } from "./subscription"
import { AutoRenewableSubscriptionIssues } from "../result"
import { parsedTransaction, parsedTransaction2 } from "../../../_.test"

const pendingRenewalInfo: ApplePendingRenewalInfo = require("../../../../samples/will_autorenew_pending_renewal_info.json")
const exampleDateMsString = "1605230970000"
const dateInPast = new Date("2000-04-04T16:00:00.000Z")
const dateInFuture = new Date(Date.now() + (30 * 60 * 1000)) // add 30 min

describe("ParsedSubscription", () => {
  describe("constructor", () => {
    it(`given no transactions, expect throw`, async () => {
      expect(() => {
        new ParsedSubscription("", false, [])
      }).toThrowErrorMatchingInlineSnapshot(
        `"BUG! Please, file a bug report: https://github.com/levibostian/dollabill-apple/issues/new?template=BUG_REPORT.md. (It's assumed that a subscription is not created if there are no transactions recorded for it.)"`
      )
    })
    it(`given transactions, expect sort`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction2, parsedTransaction])

      expect(actual.allTransactions).toEqual([parsedTransaction, parsedTransaction2])
    })
    it(`given transactions, expect populate properties`, async () => {
      const actual = new ParsedSubscription(
        "1",
        false,
        [parsedTransaction2, parsedTransaction],
        pendingRenewalInfo
      )

      expect(actual.allTransactions).toEqual([parsedTransaction, parsedTransaction2])
      expect(actual.latestExpireDateTransaction).toEqual(parsedTransaction)
      expect(actual.renewalInfo).toEqual(pendingRenewalInfo)
    })
  })
  describe("usedOfferCodes", () => {
    it(`given no offer codes, expect empty`, async () => {
      parsedTransaction.offerCodeRefName = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.usedOfferCodes()).toEqual([])
    })
    it(`given offer codes, expect get unique codes`, async () => {
      parsedTransaction.offerCodeRefName = "code-1"
      parsedTransaction2.offerCodeRefName = "code-1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.usedOfferCodes()).toEqual(["code-1"])
    })
  })
  describe("usedPromotionalOffers", () => {
    it(`given no offer codes, expect empty`, async () => {
      parsedTransaction.promotionalOfferId = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.usedPromotionalOffers()).toEqual([])
    })
    it(`given offer codes, expect get unique codes`, async () => {
      parsedTransaction.promotionalOfferId = "code-1"
      parsedTransaction2.promotionalOfferId = "code-1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.usedPromotionalOffers()).toEqual(["code-1"])
    })
  })
  describe("priceIncreaseAccepted", () => {
    it(`given no renewal info, expect undefined`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.priceIncreaseAccepted()).toBeUndefined()
    })
    it(`given no price consent info, expect undefined`, async () => {
      pendingRenewalInfo.price_consent_status = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.priceIncreaseAccepted()).toBeUndefined()
    })
    it(`given accepted price consent, expect true`, async () => {
      pendingRenewalInfo.price_consent_status = "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.priceIncreaseAccepted()).toEqual(true)
    })
    it(`given not accepted price consent, expect false`, async () => {
      pendingRenewalInfo.price_consent_status = "0"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.priceIncreaseAccepted()).toEqual(false)
    })
  })
  describe("issues", () => {
    it(`given no price consent info, expect does not include not accepting price increase`, async () => {
      pendingRenewalInfo.price_consent_status = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().notYetAcceptingPriceIncrease).toEqual(false)
    })
    it(`given no pending renewal info, expect does not include not accepting price increase`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.issues().notYetAcceptingPriceIncrease).toEqual(false)
    })
    it(`given user not yet consented to price increase, expect does include not accepting price increase`, async () => {
      pendingRenewalInfo.price_consent_status = "0"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().notYetAcceptingPriceIncrease).toEqual(true)
    })
    it(`given subscription expired from a billing issue, expect billing issue`, async () => {
      pendingRenewalInfo.expiration_intent = "2"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().billingIssue).toEqual(true)
    })
    it(`given no pending renewal info, expect no billing issue`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.issues().billingIssue).toEqual(false)
    })
    it(`given is in grace period, expect billing issue`, async () => {
      pendingRenewalInfo.grace_period_expires_date_ms = exampleDateMsString
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().billingIssue).toEqual(true)
    })
    it(`given subscription active, expect no billing issue`, async () => {
      pendingRenewalInfo.expiration_intent = undefined
      pendingRenewalInfo.grace_period_expires_date_ms = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().billingIssue).toEqual(false)
    })
    it(`given will not auto renew, expect will voluntary cancel`, async () => {
      pendingRenewalInfo.auto_renew_status = "0"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().willVoluntaryCancel).toEqual(true)
    })
    it(`given no pending renewal info, expect no will voluntary cancel`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.issues().willVoluntaryCancel).toEqual(false)
    })
    it(`given will auto renew, expect no will voluntary cancel`, async () => {
      pendingRenewalInfo.auto_renew_status = "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.issues().willVoluntaryCancel).toEqual(false)
    })
  })
  describe("issuesStrings", () => {
    it(`given all false, expect empty`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      const givenStatuses: AutoRenewableSubscriptionIssues = {
        notYetAcceptingPriceIncrease: false,
        billingIssue: false,
        willVoluntaryCancel: false
      }

      expect(actual.issuesStrings(givenStatuses)).toEqual([])
    })
    it(`given notYetAcceptingPriceIncrease, expect notYetAcceptingPriceIncrease`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      const givenStatuses: AutoRenewableSubscriptionIssues = {
        notYetAcceptingPriceIncrease: true,
        billingIssue: true,
        willVoluntaryCancel: true
      }

      expect(actual.issuesStrings(givenStatuses)).toMatchInlineSnapshot(`
        Array [
          "not_yet_accepting_price_increase",
          "billing_issue",
          "will_voluntary_cancel",
        ]
      `)
    })
  })
  describe("willAutoRenew", () => {
    it(`given no pending renewal info, expect false`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.willAutoRenew()).toEqual(false)
    })
    it(`given will not auto renew, expect false`, async () => {
      pendingRenewalInfo.auto_renew_status = "0"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.willAutoRenew()).toEqual(false)
    })
    it(`given will auto renew, expect true`, async () => {
      pendingRenewalInfo.auto_renew_status = "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.willAutoRenew()).toEqual(true)
    })
  })
  describe("gracePeriodExpireDate", () => {
    it(`given no pending renewal info, expect undefined`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.gracePeriodExpireDate()).toBeUndefined()
    })
    it(`given in grace period, expect get result`, async () => {
      pendingRenewalInfo.grace_period_expires_date_ms = exampleDateMsString
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.gracePeriodExpireDate()).toEqual(new Date(parseInt(exampleDateMsString)))
    })
  })
  describe("expireDate", () => {
    it(`expect get result from latest transaction`, async () => {
      parsedTransaction.expiresDate = dateInFuture
      parsedTransaction2.expiresDate = dateInPast
      const actual = new ParsedSubscription("1", false, [parsedTransaction2, parsedTransaction], pendingRenewalInfo)

      expect(actual.expireDate()).toEqual(dateInFuture)
    })
  })
  describe("currentEndDate", () => {
    it(`given customer got refund or upgraded, expect date`, async () => {
      parsedTransaction.cancelledDate = dateInPast
      parsedTransaction.expiresDate = dateInFuture
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.currentEndDate()).toEqual(dateInPast)
    })
    it(`given customer in grace period, expect date`, async () => {
      parsedTransaction.cancelledDate = undefined
      parsedTransaction.expiresDate = dateInFuture
      pendingRenewalInfo.grace_period_expires_date_ms = exampleDateMsString      
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.currentEndDate()).toEqual(new Date(parseInt(exampleDateMsString)))
    })
    it(`given customer not in grace period or cancelled, expect expire date`, async () => {
      parsedTransaction.cancelledDate = undefined
      parsedTransaction.expiresDate = dateInFuture
      pendingRenewalInfo.grace_period_expires_date_ms = undefined      
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.currentEndDate()).toEqual(dateInFuture)
    })
  })
  describe("willDowngradeToProductId", () => {
    it(`given no pending renewal info, expect undefined`, async () => {
      const actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.willDowngradeToProductId()).toBeUndefined()
    })
    it(`given will auto renew to another product, expect result`, async () => {
      pendingRenewalInfo.auto_renew_product_id = "other-product"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.willDowngradeToProductId()).toEqual("other-product")
    })
  })
  describe("isInBillingRetry", () => {
    it(`given customer in active status, expect false`, async () => {
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.isInBillingRetry()).toEqual(false)
    })
    it(`given customer beyond billing retry period, expect false`, async () => {
      pendingRenewalInfo.is_in_billing_retry_period = "0"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.isInBillingRetry()).toEqual(false)
    })
    it(`given customer in billing retry period, expect true`, async () => {
      pendingRenewalInfo.is_in_billing_retry_period = "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.isInBillingRetry()).toEqual(true)
    })
  })
  describe("isEligibleIntroductoryOffer", () => {
    it(`given in constructor, expect result`, async () => {
      // Note: Putting both tests in this 1 function to make sure that I am only modifying 1 single thing for each test. I don't want any false positives by tests running in random order and changing the result. Having multiple tests in 1 test function is usually bad practice. It's done on purpose here.
      let actual = new ParsedSubscription("1", false, [parsedTransaction])

      expect(actual.parseSubscription().isEligibleIntroductoryOffer).toEqual(false)      

      // Only thing changed for this test is what we pass into the constructor. 
      actual = new ParsedSubscription("1", true, [parsedTransaction])

      expect(actual.parseSubscription().isEligibleIntroductoryOffer).toEqual(true)  
    })        
  })
  describe("status", () => {
    it(`given in billing retry and in grace period, expect in grace period`, async () => {
      pendingRenewalInfo.grace_period_expires_date = exampleDateMsString
      pendingRenewalInfo.is_in_billing_retry_period == "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("grace_period")
    })
    it(`given not in grace period but in billing retry, expect in billing retry`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period == "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("billing_retry_period")
    })
    it(`given not in grace period and not in billing retry and date expired, expect voluntary cancelled`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = undefined
      parsedTransaction.cancelledDate = undefined
      parsedTransaction.refundReason = undefined
      parsedTransaction.expiresDate = dateInPast
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("voluntary_cancel")
    })
    it(`given customer had billing issue, expect involuntary cancel`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = "2"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("involuntary_cancel")
    })    
    it(`given product not available for purchase, expect involuntary cancel`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = "4"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("involuntary_cancel")
    })    
    it(`given customer voluntarily cancelled, expect voluntary cancel`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = "1"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("voluntary_cancel")
    })
    it(`given other expiration intent, expect other reason not active`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = "5"      
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("other_not_active")
    })
    it(`given customer cancelled but did not upgrade, expect refund`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = undefined
      parsedTransaction.cancelledDate = dateInPast
      parsedTransaction.refundReason = "app_issue"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("refunded")
    })
    it(`given customer cancelled and upgraded, expect upgrade`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = undefined
      parsedTransaction.cancelledDate = dateInPast
      parsedTransaction.refundReason = "upgrade"
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("upgraded")
    })
    it(`given customer cancelled for other reason, expect other`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period = undefined
      pendingRenewalInfo.expiration_intent = undefined
      parsedTransaction.cancelledDate = dateInPast
      parsedTransaction.refundReason = undefined
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("other_not_active")
    })
    it(`given no issues detected, expect active`, async () => {
      pendingRenewalInfo.grace_period_expires_date = undefined
      pendingRenewalInfo.is_in_billing_retry_period == undefined
      pendingRenewalInfo.expiration_intent = undefined
      parsedTransaction.cancelledDate = undefined
      parsedTransaction.refundReason = undefined
      parsedTransaction.expiresDate = dateInFuture
      const actual = new ParsedSubscription("1", false, [parsedTransaction], pendingRenewalInfo)

      expect(actual.status()).toEqual("active")
    })
  })
})

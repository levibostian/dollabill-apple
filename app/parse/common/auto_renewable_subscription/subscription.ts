import _ from "../../../underscore"
import { ApplePendingRenewalInfo } from "types-apple-iap"
import {
  AutoRenewableSubscription,
  AutoRenewableSubscriptionIssues,
  AutoRenewableSubscriptionIssueString,
  AutoRenewableSubscriptionStatus,
  AutoRenewableSubscriptionTransaction
} from "../../../result/auto_renewable_subscription"
import { InternalError } from "../../../parse/verify_receipt/error"

/**
 * Creates a parsed subscription from a collection of parsed transactions.
 *
 * @internal
 */
export class ParsedSubscription {
  public allTransactions: AutoRenewableSubscriptionTransaction[]
  public latestExpireDateTransaction: AutoRenewableSubscriptionTransaction
  public renewalInfo?: ApplePendingRenewalInfo

  constructor(
    public originalTransactionId: string,
    public isEligibleIntroductoryOffer: boolean,
    transactions: AutoRenewableSubscriptionTransaction[], // the transactions for the originalTransactionId. 
    renewalInfo?: ApplePendingRenewalInfo    
  ) {
    if (transactions.length <= 0)
      throw new InternalError(
        "PrerequisiteNotMet",
        "It's assumed that a subscription is not created if there are no transactions recorded for it."
      )

    this.allTransactions = transactions.sort((first, second) =>
      _.date.sortNewToOld(first.expiresDate, second.expiresDate)
    )
    this.latestExpireDateTransaction = this.allTransactions[0] // there will be at least 1 transaction or there would not be an entry in the Map<>.
    this.renewalInfo = renewalInfo
  }

  parseSubscription(): AutoRenewableSubscription {
    const issues = this.issues()
    
    return {
      currentProductId: this.latestExpireDateTransaction.productId,
      originalTransactionId: this.originalTransactionId,
      subscriptionGroup: this.latestExpireDateTransaction.subscriptionGroupId,
      isInFreeTrialPeriod: this.latestExpireDateTransaction.inTrialPeriod,
      isEligibleIntroductoryOffer: this.isEligibleIntroductoryOffer,
      currentEndDate: this.currentEndDate(),
      status: this.status(),
      usedOfferCodes: this.usedOfferCodes(),
      usedPromotionalOffers: this.usedPromotionalOffers(),
      allTransactions: this.allTransactions,
      latestExpireDateTransaction: this.latestExpireDateTransaction,
      willAutoRenew: this.willAutoRenew(),
      willDowngradeToProductId: this.willDowngradeToProductId(),
      issuesStrings: this.issuesStrings(issues),  
      issues,
      priceIncreaseAccepted: this.priceIncreaseAccepted(),
      gracePeriodExpireDate: this.gracePeriodExpireDate(),
      cancelledDate: this.cancelledDate(),
      expireDate: this.expireDate(),
      isInBillingRetry: this.isInBillingRetry()
    }
  }

  usedOfferCodes(): string[] {
    const set = new Set(this.allTransactions
      .filter((transaction) => transaction.offerCodeRefName)
      .map((transaction) => transaction.offerCodeRefName!))

    return [...set]
  }

  usedPromotionalOffers(): string[] {
    const set = new Set(this.allTransactions
      .filter((transaction) => transaction.promotionalOfferId)
      .map((transaction) => transaction.promotionalOfferId!))

    return [...set]
  }

  priceIncreaseAccepted(): boolean | undefined {
    let priceIncreaseAccepted: boolean | undefined
    if (this.renewalInfo?.price_consent_status) {
      priceIncreaseAccepted = this.renewalInfo.price_consent_status === "1"
    }

    return priceIncreaseAccepted
  }

  issues(): AutoRenewableSubscriptionIssues {
    return {
      notYetAcceptingPriceIncrease: this.priceIncreaseAccepted() === false,
      billingIssue: this.renewalInfo?.expiration_intent === "2" || this.gracePeriodExpireDate() !== undefined,
      willVoluntaryCancel: this.renewalInfo !== undefined && !this.willAutoRenew()
    }
  }

  issuesStrings(statuses: AutoRenewableSubscriptionIssues): AutoRenewableSubscriptionIssueString[] {
    const strings: AutoRenewableSubscriptionIssueString[] = []

    if (statuses.notYetAcceptingPriceIncrease) strings.push("not_yet_accepting_price_increase")
    if (statuses.billingIssue) strings.push("billing_issue")
    if (statuses.willVoluntaryCancel) strings.push("will_voluntary_cancel")

    return strings 
  }

  willAutoRenew(): boolean {
    return this.renewalInfo?.auto_renew_status === "1" || false
  }

  gracePeriodExpireDate(): Date | undefined {
    if (this.renewalInfo?.grace_period_expires_date_ms) return new Date(parseInt(this.renewalInfo.grace_period_expires_date_ms!))

    return undefined
  }

  expireDate(): Date {
    return this.latestExpireDateTransaction.expiresDate
  }

  currentEndDate(): Date {
    return this.cancelledDate() || this.gracePeriodExpireDate() || this.expireDate()
  }

  willDowngradeToProductId(): string | undefined {
    return this.renewalInfo?.auto_renew_product_id
  }

  isInBillingRetry(): boolean {
    return this.renewalInfo?.is_in_billing_retry_period === "1" || false 
  }

  cancelledDate(): Date | undefined {
    return this.latestExpireDateTransaction.cancelledDate
  }

  status(): AutoRenewableSubscriptionStatus {
    const inGracePeriod = this.renewalInfo?.grace_period_expires_date !== undefined || false 
    if (inGracePeriod) return "grace_period"

    const isInBillingRetry = this.renewalInfo?.is_in_billing_retry_period === "1" || false 
    if (isInBillingRetry) return "billing_retry_period"

    if (this.renewalInfo?.expiration_intent !== undefined) {
      const involuntaryCancelled = this.renewalInfo.expiration_intent === "2" || this.renewalInfo.expiration_intent === "4"
      if (involuntaryCancelled) return "involuntary_cancel"

      const voluntaryCancelled = this.renewalInfo.expiration_intent === "1" || false
      if (voluntaryCancelled) return "voluntary_cancel"
  
      return "other_not_active"
    }    

    if (this.latestExpireDateTransaction.cancelledDate !== undefined || this.latestExpireDateTransaction.refundReason !== undefined) {      
      const refunded = this.latestExpireDateTransaction.refundReason === "app_issue" || this.latestExpireDateTransaction.refundReason === "other"
      if (refunded) return "refunded"
  
      const upgraded = this.latestExpireDateTransaction.refundReason === "upgrade"        
      if (upgraded) return "upgraded"

      return "other_not_active"
    }    

    // Note: this should be caught by the "expiration_intent" of the pending renewal object but just in case, we want to catch when the customer has gone beyond the billing retry period and there is still a billing issue. 
    if (this.latestExpireDateTransaction.expiresDate.getTime() < new Date().getTime()) {
      return "voluntary_cancel"
    }

    return "active"
  }
}
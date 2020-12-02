import { AppleLatestReceiptInfo } from "types-apple-iap"

export type AutoRenewableSubscriptionRefundReason = "upgrade" | "app_issue" | "other"

/**
 * Receipt for an auto-renewable subscription.
 */
export type AutoRenewableSubscriptionTransaction = {
  productId: string
  cancelledDate?: Date
  refundReason?: AutoRenewableSubscriptionRefundReason
  expiresDate: Date
  inIntroPeriod: boolean
  inTrialPeriod: boolean
  isUpgradeTransaction: boolean
  offerCodeRefName?: string
  originalPurchaseDate: Date
  originalTransactionId: string
  promotionalOfferId?: string
  purchaseDate: Date
  subscriptionGroupId: string
  transactionId: string
  webOrderLineItemId?: string
  /**
   * [Learn more](https://developer.apple.com/documentation/appstorereceipts/original_transaction_id)
   */
  isRenewOrRestore: boolean
  /**
   * [Learn more](https://developer.apple.com/documentation/appstorereceipts/original_transaction_id)
   */
  isFirstSubscriptionPurchase: boolean
  rawTransaction: AppleLatestReceiptInfo
}

/**
 * See {@link AutoRenewableSubscriptionActionableStatus}
 */
export type AutoRenewableSubscriptionIssueString =
  | "not_yet_accepting_price_increase"
  | "billing_issue"
  | "will_voluntary_cancel"

/**
 * Options:
 * 1. **not_yet_accepting_price_increase** - You have introduced a price increase. The customer has been notified about it but has not yet accepted it. This means the customer's subscription may be expired if they do not accept it.
 * 3. **billing_issue** - the subscription expired because of a billing issue.
 * 3. **will_voluntary_cancel** // time to send them UI saying to downgrade to try and keep them
 */
export interface AutoRenewableSubscriptionIssues {
  notYetAcceptingPriceIncrease: boolean
  billingIssue: boolean
  willVoluntaryCancel: boolean
} 

/**
 * Options:
 * 1. **active** - when no issue is detected, the subscription is active. There are other statuses, however, that determine if the subscription is still a valid one (such as "grace_period"). 
 * 2. **billing_retry_period** - When the subscription is beyond the grace period, but Apple is still trying to restore the purchase. 
 * 3. **voluntary_cancel** - they cancelled the subscription. You should not give the customer any access to the paid content.
 * 4. **grace_period** - There is a billing issue and Apple is attempting to automatically renew the subscription. Grace period means the customer has not cancelled or refunded. You have not yet lost them as a customer.
 *
 * > Tip: You can open the link `https://apps.apple.com/account/billing` to send the user to their payment details page in the App Store to update their payment information.
 *
 * 5. **involuntary_cancel** - the customer had a billing issue and their subscription is no longer active. Maybe you (1) did not enable the *Grace Period* feature in App Store Connect and the customer has encountered a billing issue or (2) you did enable the *Grace Period* feature but Apple has since given up on attempting to renew the subscription for the customer. You should no longer give the customer access to the paid content.
 * 6. **refunded** - the customer contacted Apple support and asked for a refund of their purchase and received the partial or full refund. You should not give the customer any access to the paid content. You may optionally offer another subscription plan to them to switch to a different offer that meets their needs better.
 * 7. **other_not_active** - attempt to be future-proof as much as possible. *active* is only if we confirm that there are not cancellations, no expiring, no billing issues, etc. But if Apple drops on us some random new feature or expiration intent that this library doesn't know how to parse yet (or this version you have installed doesn't yet) you will get in the catch-all *other_not_active*. 
 * 8. **upgraded** - this subscription is no longer active, it has been cancelled because the customer upgraded to a new subscription group level and created a new subscription with that. 
 */
export type AutoRenewableSubscriptionStatus = "active" | "billing_retry_period" | "grace_period" | "voluntary_cancel" | "upgraded" | "involuntary_cancel" | "refunded" | "other_not_active"

/**
 * Auto-renewable subscription.
 * 
 * What is a subscription? It's simply a series of subscription periods where each period has a start time (purchase date) and an end time (expire date) where the customer's access to that product is active. 
 * 
 * When the first purchase is made along with all future renewals (including when the customer restores a subscription after a billing issue) all of these transactions, free trials, discounts, all come together as subscription periods into a subscription. 
 * 
 * Subscriptions are identified by the list of transactions with the same {@link originalTransactionId}. 
 * 
 * > Note: This is auto-renewable *only*. Non auto-renewable subscriptions are up to you to handle how long they last and prompting your customers to purchase again.
 */
export interface AutoRenewableSubscription {  
  /**
   * The `product_id` of the subscription the customer is currently paying for or did pay for. This value may change if the customer changes to a different product.
   */
  currentProductId: string
  /**
   * Used to identify a subscription. 
   * 
   * This same id will be used for all future renewals or restores. This may include a downgrade or crossgrade performed by a user. Upgrades and crossgrades with the same duration are cancelled and a new subscription is created. 
   */
  originalTransactionId: string
  /**
   * The subscription group the subscription's product_id belongs to.
   */
  subscriptionGroup: string
  /**
   * Indicates if the customer is currently in the free trial period of their subscription.
   */
  isInFreeTrialPeriod: boolean
  /**
   * Determine if the customer is eligible for an introductory offer. New customers are always eligible but existing customers who have not yet redeemed an offer are also eligible. This field determines if the customer has ever redeemed an offer for the subscription group this subscription belongs to.
   *
   * [Learn more about how to implement intro offers in your app](https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/implementing_introductory_offers_in_your_app)
   */
  isEligibleIntroductoryOffer: boolean
  /**
   * The current end date of this subscription. This is a date that is calculated for you by evaluating the expires date, if there was a cancellation stopping the subscription early, or if the subscription is in a grace period and you should extend access. 
   * 
   * This is the date that you can use to determine how long your customer should have access to the subscription content. 
   * 
   * > Note: This date can increase and decrease at anytime. The subscription can be cancelled immediately (through refund or upgrade/crossgrade). Do not assume that it only increases. 
   */
  currentEndDate: Date
  /**
   * Status of the subscription. 
   *
   * > Note: This value does *not* determine if the customer will renew or not. It is more designed to determine their paid status *at this moment*. See {@link actionableStatuses} to get info about the future of the subscription.
   */
  status: AutoRenewableSubscriptionStatus
  /**
   * If the customer has redeemed an offer code, this field will be populated with the reference name that you set for the offer.
   *
   * You determine in App Store Connect is an offer code is available for new, active, or expired users.
   * 
   * > Note: This is a unique list based off the reference name. If the same offer is used multiple times, it's only listed here once. 
   */
  usedOfferCodes: string[]
  /**
   * If the customer has used any promotional offers for this subscription, all of them are listed here. 
   * 
   * > Note: This is a unique list based off the reference name. If the same offer is used multiple times, it's only listed here once. 
   */
  usedPromotionalOffers: string[]
  /**
   * All transactions for this subscription. Ordered by *the expiration date* of the transaction with the latest expire date first in the list. This sort order is recommended by Apple in this WWDC video: https://developer.apple.com/videos/play/wwdc2018/705/ as the method to determine the subscription period. 
   *
   * See {@link latestExpireDateTransaction}
   */
  allTransactions: AutoRenewableSubscriptionTransaction[]
  /**
   * For convenience, the first entry of {@link allTransactions}. 
   *
   * See {@link allTransactions}
   */
  latestExpireDateTransaction: AutoRenewableSubscriptionTransaction
  /**
   * If the customer is currently planning on automatically renewing their subscription. 
   * 
   * A customer at anytime may decide to go into their Apple account and setup their subscription to cancel after their current subscription period expires.
   * 
   * > Note: This value is also true if the customer is going to downgrade to another product at the end of the subscription period. Just because they will auto renew does not mean they will auto renew the current product. See {@link willDowngradeToProductId}. 
   */
  willAutoRenew: boolean
  /**
   * If the customer decides to downgrade their subscription, this is the product id that they will change to when the current subscription period is over.
   */
  willDowngradeToProductId?: string
  /**
   * Strings version of {@link actionableStatuses}. This strings version is convenient for storing in a database or sending to a client application for easy parsing. That way you can handle issues in the UI of your client apps and get the issues resolved. 
   */
  issuesStrings: AutoRenewableSubscriptionIssueString[]
  /**
   * Various statuses about this subscription beyond if the customer should be given access to the paid content or not (see {@link subscriptionPaidStatus}). These values are meant to be helpful in notifying your customer, if you choose to do so, to reduce losing customers. Maybe the customer is having a billing issue and they need to update their credit card, maybe you have introduced a pricing increase and the customer has not yet accepted it yet. There are many scenarios and it's up to you to decide what to act upon.
   *
   * See {@link actionableStatusesStrings} for a string version. 
   */
  issues: AutoRenewableSubscriptionIssues
  /**
   * If the customer has been notified and then accepted a price increase.
   *
   * This value is populated only if the customer has been notified of the increase. If it's undefined, the customer has not yet been notified or there is not a price increase happening.
   */
  priceIncreaseAccepted?: boolean
  /**
   * The date that the grace period should end. If a user recovers their subscription billing before this date, the user's subscription will go uninterrupted. If they do not, they can still fix the issue after the date but the subscription will go through a recovery because the subscription will be restored. 
   *
   * > Note: This field will not be populated if the customer is not in a grace period for this subscription.
   */
  gracePeriodExpireDate?: Date
  /**
   * Date that the customer cancelled their subscription, if they did. 
   */
  cancelledDate?: Date
  /**
   * The date that the current subscription period will end if not renewed or later on restored. If the subscription is cancelled or goes into a grace period, this Date does not change. It only changes if the subscription gets renewed or restored. 
   * 
   * See {@link currentEndDate} for a Date that puts into effect if a subscription is cancelled or is in a grace period. 
   */
  expireDate: Date
  /**
   * If the user is in billing retry state. This starts after a billing issue has occurred and lasts as long as Apple wishes (documentation currently says "up to 60 days"). 
   * 
   * This field *can* be `true` even after the {@link gracePeriodExpireDate} as lapsed. The grace period time is much shorter: 6-16 days depending on the subscription date. 
   */
  isInBillingRetry: boolean
}

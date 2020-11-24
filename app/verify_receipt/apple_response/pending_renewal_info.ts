/**
 * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/responsebody/pending_renewal_info)
 */
export interface ApplePendingRenewalInfo {
  /**
   * The product id the customer will downgrade/crossgrade to when the current subscription period is over.
   *
   * > Note: Present if the user is downgrading or crossgrading.
   */
  auto_renew_product_id?: string
  /**
   * 1 - Subscription will auto-renew
   * 0 - Customer turned off auto-renew
   *
   * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/auto_renew_status)
   */
  auto_renew_status: "1" | "0"
  /**
   * Reason subscription expired.
   *
   * 1 - Customer cancelled their subscription
   * 2 - Billing error such as payment information not valid
   * 3 - Customer did not agree to price increase
   * 4 - Product not available for purchase
   * 5 - Unknown error
   *
   * > Note: Present for a receipt that contains an expired auto-renewable subscription.
   *
   * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/expiration_intent)
   */
  expiration_intent?: "1" | "2" | "3" | "4" | "5"
  /**
   * When Apple will stop automatically retrying to renew the expired subscription.
   *
   * > Note: Present if in a grace period
   */
  grace_period_expires_date?: string
  /**
   * When Apple will stop automatically retrying to renew the expired subscription.
   *
   * > Note: Present if in a grace period
   */
  grace_period_expires_date_ms?: string
  /**
   * When Apple will stop automatically retrying to renew the expired subscription.
   *
   * > Note: Present if in a grace period
   */
  grace_period_expires_date_pst?: string
  /**
   * If auto-renewable subscription is actively trying to be automatically renewed by Apple. Check the {@link expires_intent}, {@link expires_intent} to determine if Apple is trying to renew *before or after* the subscription has expired. If the subscription has expired, you are going to need to think through the logic of Grace Periods. Read more about Grace Periods to learn more about them.
   *
   * 1 - Apple is trying to renew the subscription. See {@link grace_period_expires_date} to determine when Apple will stop trying.
   * 0 - Apple has stopped attempting to renew.
   *
   * > Note: Present if auto-renewable subscription has expired and Apple is or is not trying to renew it.
   *
   * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/is_in_billing_retry_period)
   */
  is_in_billing_retry_period?: "0" | "1"
  /**
   * > Note: Present if the customer redeemed [an offer code](https://developer.apple.com/app-store/subscriptions/#offer-codes).
   *
   * Resources:
   * 1. [Overview of what offer codes are](https://developer.apple.com/app-store/subscriptions/#offer-codes)
   * 2. [Set up offer codes](https://help.apple.com/app-store-connect/#/dev6a098e4b1)
   * 3. [Implement offer codes in your app](https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/implementing_offer_codes_in_your_app)
   */
  offer_code_ref_name?: string
  /**
   * The transaction ID that identifies a full payment history for a customer paying for a subscription through all of the renewals, upgrades/downgrades.
   *
   * [More details](https://developer.apple.com/documentation/appstorereceipts/original_transaction_id)
   */
  original_transaction_id: string
  /**
   * 1 - customer accepted the price increase
   * 0 - customer has not yet accepted the price increase
   *
   * > Note: Present if the customer was notified of price increase. When you enable a price increase for existing customers, Apple follows a schedule that it has set. [View the schedule here](https://help.apple.com/app-store-connect/#/devc9870599e) in the section "Increase the price of an auto-renewable subscription".
   *
   * See {@link expiration_intent} as the customer will have their subscription expire if they never accept the price increase.
   */
  price_consent_status?: "0" | "1"
  /**
   * Product id this renewal information is referring to.
   */
  product_id: string
}

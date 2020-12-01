import { AppleServerNotificationType, AppleVerifyReceiptResponseBodySuccess, AppleServerNotificationResponseBody } from "types-apple-iap";
import { AutoRenewableSubscription } from "./auto_renewable_subscription";
import { ProductPurchases } from "./purchase";

/**
 * The common parsed results between all functions in this module. This type is important because we want devs who use this module to be able to use the same code-base for handling the result. 
 */
export interface ParsedResult {
  /**
   * The environment for which the receipt was generated.
   *
   * This value is important to notice so you can determine what transactions were made against a real credit card.
   */
  environment: "Sandbox" | "Production"
  /**
   * Bundle ID of the app this purchase was made for. 
   */
  bundleId: string
  /**
   * Version of the app used to make this purchase. (`CFBundleVersion` in iOS or `CFBundleShortVersion` in macOS). 
   * 
   * > Note: In the sandbox environment, this value is always "1.0"
   */
  appVersion: string
  /**
   * All of the auto-renewable subscriptions for the customer. There is an object for each subscription. If the user has upgraded/downgraded a subscription that's within the same subscription group, you will still only see 1 object with that upgrade/downgrade in. This array will contain 1 object for each subscription purchase the customer has made.
   *
   * Note: How is this determined? Each object in this array represents a unique `original_transaction_id`
   */
  autoRenewableSubscriptions: AutoRenewableSubscription[]  
  /**
   * Consumables, non-consumables, and non auto-renewable subscriptions.
   *
   * * Consumable: A product that is used once, after which it becomes depleted and must be purchased again. Example: Fish food for a fishing app.
   * * Non-consumable: A product that is purchased once and does not expire or decrease with use. Example: Race track for a game app.
   * * Non auto-renewable subscription: A subscription type where you are responsible for determining when it expires and you prompt the customer to make a new purchase.
   *
   * This list is a list of all purchased delivered by Apple. It is up to you to unlock content, keep track of that has already been redeemed or expired. Consider this simply a list of receipts you must read through to determine the customer's status.
   *
   * This list is sorted by *the purchase date* with the most recent purchase being first.
   */
  productPurchases: ProductPurchases[]
  /**
   * The latest Base64 encoded app receipt. Only returned for receipts that contain auto-renewable subscriptions.
   *
   * You can optionally store this value in your database to conduct *status polling*.
   *
   * > Note: Only returned for receipts that contain auto-renewable subscriptions.
   */
  latestReceipt?: string 
  /**
   * The raw JSON response back from Apple. This exists in case this library has not been updated, something new gets released from Apple, and you need to access it.
   *
   * The Typescript typings below are for your convenience. If Apple updates the response when they come out with a new feature and this library has not been updated to include this change from Apple, know that you can treat this field like `any` and access any property that you wish. This is simply the full, unmodified, response from Apple.
   */
  rawResponse: AppleVerifyReceiptResponseBodySuccess | AppleServerNotificationResponseBody
  /**
   * > Note: Only present when a server-to-server notification was parsed. 
   */
  notificationReason?: AppleServerNotificationType
}

import { AppleServerNotificationType, AppleVerifyReceiptResponseBodySuccess, AppleServerNotificationResponseBody } from "types-apple-iap";
import { AutoRenewableSubscription } from "./auto_renewable_subscription";
import { ProductPurchases } from "./purchase";

/**
 * The parsed result for all functions in this module. By having a type that is the same across the module, developers can re-use the same logic for updating their customer's subscription statuses. 
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
   * All of the auto-renewable subscriptions for the customer. *There is an object for each subscription.* Each object is a collection of transactions with the same `original_transaction_id`. 
   * 
   * This list has no order. It's meant for you to iterate through and update the status of your customer for each subscription. 
   */
  autoRenewableSubscriptions: AutoRenewableSubscription[]  
  /**
   * Consumables, non-consumables, and not auto-renewable subscriptions. *There is an object for product.* Each object is a collection of transactions with the same `product_id`. 
   *
   * * Consumable: A product that is used once, after which it becomes depleted and must be purchased again. Example: Fish food for a fishing app.
   * * Non-consumable: A product that is purchased once and does not expire or decrease with use. Example: Race track for a game app.
   * * Non auto-renewable subscription: A subscription type where you are responsible for determining when it expires and you prompt the customer to make a new purchase.
   *
   * This list is a list of all purchased delivered by Apple. It is up to you to unlock content, keep track of that has already been redeemed or expired. Consider this simply a list of receipts you must read through to determine the customer's status.   
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
   * The raw JSON response back from Apple. This exists in case this library has not been updated, something new gets released from Apple, and you need to access it. Hopefully you don't need to use it because that means this module provides enough value through it's parsing that you don't have a need for this. 
   *
   * The Typescript typings below are for your convenience. If Apple updates the response when they come out with a new feature and this library has not been updated to include this change from Apple, know that you can treat this field like `any` and access any property that you wish. This is simply the full, unmodified, response from Apple.
   * 
   * It's up to you to cast this property to one of the types depending on what feature of the module that you called. Example: If you just verified a receipt through this module, then you would cast `rawResponse` to `AppleVerifyReceiptResponseBodySuccess` before using it. 
   */
  rawResponse: AppleVerifyReceiptResponseBodySuccess | AppleServerNotificationResponseBody
  /**
   * The reason for the notification from Apple. 
   * 
   * > Note: Only present when a server-to-server notification was parsed. 
   */
  notificationReason?: AppleServerNotificationType
}

/**
 * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/responsebody/receipt/in_app)
 */
export interface AppleInAppPurchaseTransaction {
  /**
   * Date Apple issued a refund to customer. Refund could be because of customer asking for a refund or a subscription upgrade occurred.
   *
   * > Note: Only present if a refund was made.
   */
  cancellation_date?: string
  /**
   * See {@link cancellation_date}
   */
  cancellation_date_ms?: string
  /**
   * See {@link cancellation_date}
   */
  cancellation_date_pst?: string
  /**
   * Reason for the refund issued for a customer asking to end their subscription immediately.
   *
   * 1 - Customer indicated they had a problem using your app and wanted a refund.
   * 0 - Customer cancelled for another reason such as making purchase by mistake.
   */
  cancellation_reason?: "0" | "1"
  /**
   * Time subscription expires or will renew.
   *
   * > Note: Only present if ths is an auto-renewable subscription purchase
   */
  expires_date?: string
  /**
   * See {@link expires_date}
   */
  expires_date_ms: string
  /**
   * See {@link expires_date}
   */
  expires_date_pst: string
  /**
   * > Note: Only present if this is an auto-renewable subscription purchase
   *
   * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/is_in_intro_offer_period)
   */
  is_in_intro_offer_period?: "true" | "false"
  /**
   * > Note: Only present if this is an auto-renewable subscription purchase
   *
   * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/is_trial_period)
   */
  is_trial_period?: "true" | "false"
  original_purchase_date: string
  original_purchase_date_ms: string
  original_purchase_date_pst: string
  original_transaction_id: string
  product_id: string
  promotional_offer_id?: string
  purchase_date: string
  purchase_date_ms: string
  purchase_date_pst: string
  /**
   * Number of consumable products purchased.
   *
   * > Note: This value is usually present with purchases that are not consumables but it's an optional field here in case Apple changes that in the future and only includes it for consumable purchases, only.
   */
  quantity?: string
  transaction_id: string
  /**
   * > Note: Only present for subscription purchases
   */
  web_order_line_item_id?: string
}

/**
 * A JSON representation of the receipt that was sent for verification.
 *
 * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/responsebody/receipt)
 */
export interface AppleReceipt {
  adam_id: number
  app_item_id: number
  application_version: string
  bundle_id: string
  download_id: number
  /**
   * > Note: Only present if app was purchased through the Volume Purchase Program.
   */
  expiration_date?: string
  /**
   * See {@link expiration_date}.
   */
  expiration_date_ms?: string
  /**
   * See {@link expiration_date}.
   */
  expiration_date_pst?: string
  /**
   * Transactions for non-consumable, non-renewing subscriptions, and auto-renewing subscriptions previously purchased by the customer.
   *
   * This response is similar but different then `latest_receipt_info` where that is used most often for auto-renewable subscription transactions to see if a subscription is up-to-date or not.
   */
  in_app?: AppleInAppPurchaseTransaction[]
  original_application_version: string
  original_purchase_date: string
  original_purchase_date_ms: string
  original_purchase_date_pst: string
  /**
   * > Note: Only present if the app was ordered through pre-order.
   */
  preorder_date?: string
  /**
   * See {@link preorder_date}
   */
  preorder_date_ms?: string
  /**
   * See {@link preorder_date}
   */
  preorder_date_pst?: string
  receipt_creation_date: string
  receipt_creation_date_ms: string
  receipt_creation_date_pst: string
  receipt_type: "Production" | "ProductionVPP" | "ProductionSandbox" | "ProductionVPPSandbox"
  request_date: string
  request_date_ms: string
  request_date_pst: string
  version_external_identifier: number
}

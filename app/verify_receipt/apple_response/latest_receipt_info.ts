import { AppleInAppPurchaseTransaction } from "./receipt"

/**
 * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/responsebody/latest_receipt_info)
 */
export type AppleLatestReceiptInfo = AppleInAppPurchaseTransaction & {
  /**
   * Indicates a subscription has been cancelled because of an upgrade.
   *
   * > Note: Only present for an upgrade transaction.
   */
  is_upgraded?: "true"
  offer_code_ref_name?: string
  /**
   * > Note: Only present for an auto-renewable subscription.
   */
  subscription_group_identifier?: string
}

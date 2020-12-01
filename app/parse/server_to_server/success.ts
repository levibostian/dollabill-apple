import { ParsedResult } from "../../result/parsed_result"
import { AppleServerNotificationResponseBody } from "types-apple-iap"
import { parseSubscriptions } from "../common/auto_renewable_subscription"
import { parsePurchases } from "../common/purchase"

/**
 * @internal 
 */
export const parseSuccess = (response: AppleServerNotificationResponseBody): ParsedResult => {
  const subscriptions = parseSubscriptions(response.unified_receipt.latest_receipt_info, response.unified_receipt.pending_renewal_info, undefined)
  const purchases = parsePurchases(response.unified_receipt.latest_receipt_info, undefined)

  return {
    environment: response.unified_receipt.environment,
    bundleId: response.bid,
    appVersion: response.bvrs,
    autoRenewableSubscriptions: subscriptions,
    productPurchases: purchases,
    rawResponse: response,
    notificationReason: response.notification_type,
    latestReceipt: response.unified_receipt.latest_receipt
  }
}

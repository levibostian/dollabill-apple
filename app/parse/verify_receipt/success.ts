import { ParsedResult } from "../../result/parsed_result"
import { AppleVerifyReceiptResponseBodySuccess } from "types-apple-iap"
import { parseSubscriptions } from "../common/auto_renewable_subscription"
import { parsePurchases } from "../common/purchase"

/**
 * @internal 
 */
export const parseSuccess = (response: AppleVerifyReceiptResponseBodySuccess): ParsedResult => {
  const subscriptions = parseSubscriptions(response.latest_receipt_info, response.pending_renewal_info, response.receipt.in_app)
  const purchases = parsePurchases(response.latest_receipt_info, response.receipt.in_app)

  return {
    environment: response.environment,
    bundleId: response.receipt.bundle_id,
    appVersion: response.receipt.application_version,
    autoRenewableSubscriptions: subscriptions,
    productPurchases: purchases,
    rawResponse: response,
    latestReceipt: response.latest_receipt
  }
}

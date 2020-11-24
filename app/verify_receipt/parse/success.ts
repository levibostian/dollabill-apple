import { AppleVerifyReceiptSuccessfulResponse } from "../apple_response/success"
import { parseSubscriptions } from "./auto_renewable_subscription"
import { parsePurchases } from "./purchase"
import { ParsedReceipt } from "./result/parsed_receipt"

/**
 * @internal 
 */
export const parseSuccess = (response: AppleVerifyReceiptSuccessfulResponse): ParsedReceipt => {
  const subscriptions = parseSubscriptions(response)
  const purchases = parsePurchases(response)

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

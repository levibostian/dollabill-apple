import { AppleVerifyReceiptErrorResponse } from "./error"
import { AppleLatestReceiptInfo } from "./latest_receipt_info"
import { ApplePendingRenewalInfo } from "./pending_renewal_info"
import { AppleReceipt } from "./receipt"

/**
 * All of the statuses that are successful. Apple is able to return back receipt information when any of these status codes occur.
 *
 * > Note: 0 means the receipt is valid. 21006 means it's valid, but the subscription is expired. You will still receive back a receipt decoded in the response with this status code.
 *
 * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/status)
 */
export enum AppleVerifyReceiptSuccessfulStatus {
  SUCCESS = 0,
  NOTING_PURCHASED = 2, // Not documented, but I guess it can happen: https://github.com/voltrue2/in-app-purchase/blob/e966ee1348bd4f67581779abeec59c4bbc2b2ebc/lib/apple.js#L15
  VALID_BUT_SUBSCRIPTION_EXPIRED = 21006
} 

export interface AppleVerifyReceiptSuccessfulResponse {
  /**
   * The environment that Apple made the Receipt for.
   */
  environment: "Sandbox" | "Production"  
  /**
   * Base64 encoded string for the latest receipt from Apple.
   *
   * > Note: Only present if the receipt contains auto-renewable subscriptions.
   */
  latest_receipt?: string
  /**
   * All in-app purchase transactions except transactions for consumable products marked as finished by your app.
   *
   * This is the preferred place to look for the status of subscriptions and non-consumables. The field is similar but different from the transactions list in `receipt > in_app`. This field is the *latest transactions up to this moment* while the `in_app` field contains the transactions for the given receipt that got sent to Apple to process, only. If the receipt you sent up to get verified is out-of-date then `in_app` will be out-of-date.
   *
   * > Note: This is only present if the customer has purchased auto-renewable subscriptions.
   */
  latest_receipt_info?: AppleLatestReceiptInfo[]
  /**
   * All auto-renewable subscription status of their renewals.
   *
   * > Note: Only present if the receipt contains auto-renewable subscriptions.
   */
  pending_renewal_info?: ApplePendingRenewalInfo[]
  /**
   * JSON version of the receipt that was sent to Apple for verifying.
   */
  receipt: AppleReceipt
  /**
   * Determines if the receipt is a valid one, or there is some other result. Maybe the receipt is not valid, maybe you the developer made a mistake, maybe the Apple server encountered a problem.
   */
  status: AppleVerifyReceiptSuccessfulStatus
}

export type AppleVerifyReceiptResponse =
  | AppleVerifyReceiptErrorResponse
  | AppleVerifyReceiptSuccessfulResponse

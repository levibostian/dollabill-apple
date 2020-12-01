import { AppleLatestReceiptInfo } from "types-apple-iap"
import {
  AutoRenewableSubscriptionRefundReason,
  AutoRenewableSubscriptionTransaction
} from "../../../result/auto_renewable_subscription"
import { InternalError } from "../../../parse/verify_receipt/error"

/**
 * Takes in a response from Apple transaction and produces a parsed transaction. Keeps track of all of them by grouping them together by subscription group.
 *
 * @internal
 */
export class ParsedTransactions {  

  // key is `original_transaction_id` as that's the way to group subscriptions
  private transactions: Map<string, AutoRenewableSubscriptionTransaction[]> = new Map()  
  // key is `subscription_group_identifier` as we must determine if eligible for intro offer across multiple subscriptions. 
  // From "Determine Eligibility" section in: https://web.archive.org/web/20200908054522if_/https://developer.apple.com/documentation/storekit/in-app_purchase/subscriptions_and_offers/implementing_introductory_offers_in_your_app
  private isEligibleIntroductoryOffer: Map<string, boolean> = new Map()

  addTransaction(transaction: AppleLatestReceiptInfo): void {
    if (!ParsedTransactions.isAutoRenewableSubscriptionTransaction(transaction))
      throw new InternalError(
        "PrerequisiteNotMet",
        `Filter out all transactions that are *not* subscription transactions before calling this function.`
      )

    const existingTransactions = this.getParsedTransactions(transaction) || []

    existingTransactions.push(this.parseTransaction(transaction))

    this.transactions.set(transaction.original_transaction_id, existingTransactions)

    this.updateIsEligibleIntroductoryOffer(transaction)
  }

  iterateParsedTransactions(): IterableIterator<AutoRenewableSubscriptionTransaction[]> {
    return this.transactions.values()
  }

  getParsedTransactions(transaction: AppleLatestReceiptInfo): AutoRenewableSubscriptionTransaction[] | undefined {
    return this.transactions.get(transaction.original_transaction_id)
  }

  getIsEligibleIntroductoryOffer(transaction: AppleLatestReceiptInfo | AutoRenewableSubscriptionTransaction): boolean {
    const key = (transaction as AppleLatestReceiptInfo).subscription_group_identifier || (transaction as AutoRenewableSubscriptionTransaction).subscriptionGroupId

    return this.isEligibleIntroductoryOffer.get(key) || false
  }

  static isAutoRenewableSubscriptionTransaction(transaction: AppleLatestReceiptInfo): boolean {
    return transaction.expires_date !== undefined && transaction.expires_date !== null
  }

  updateIsEligibleIntroductoryOffer(transaction: AppleLatestReceiptInfo): void {
    const ifNotEligible = transaction.is_trial_period === "true" || transaction.is_in_intro_offer_period === "true"
    const isEligible = !ifNotEligible    
    const id = transaction.subscription_group_identifier!

    const existingValue = this.isEligibleIntroductoryOffer.get(id)
    if (existingValue !== undefined && existingValue === false) return // we never want to overwrite value that is false already. once it's not eligible, it's never eligible. 

    this.isEligibleIntroductoryOffer.set(transaction.subscription_group_identifier!, isEligible)
  }

  refundReason(transaction: AppleLatestReceiptInfo): AutoRenewableSubscriptionRefundReason | undefined {
    if (!transaction.cancellation_date_ms) return undefined

    if (transaction.is_upgraded) return "upgrade"
    else return transaction.cancellation_reason === "1" ? "app_issue" : "other"
  }

  isRenewOrRestore(transaction: AppleLatestReceiptInfo): boolean {
    return transaction.original_transaction_id !== transaction.transaction_id
  }

  parseTransaction(
    transaction: AppleLatestReceiptInfo
  ): AutoRenewableSubscriptionTransaction {    
    const isRenewOrRestore = this.isRenewOrRestore(transaction)

    return {
      productId: transaction.product_id,
      cancelledDate: transaction.cancellation_date_ms
        ? new Date(parseInt(transaction.cancellation_date_ms!))
        : undefined,
      refundReason: this.refundReason(transaction),
      expiresDate: new Date(parseInt(transaction.expires_date_ms!)),
      inIntroPeriod: transaction.is_in_intro_offer_period === "true",
      inTrialPeriod: transaction.is_trial_period === "true",
      isUpgradeTransaction: transaction.is_upgraded === "true",
      offerCodeRefName: transaction.offer_code_ref_name,
      originalPurchaseDate: new Date(parseInt(transaction.original_purchase_date_ms)),
      originalTransactionId: transaction.original_transaction_id,
      promotionalOfferId: transaction.promotional_offer_id,
      purchaseDate: new Date(parseInt(transaction.purchase_date_ms)),
      subscriptionGroupId: transaction.subscription_group_identifier!,
      transactionId: transaction.transaction_id,
      webOrderLineItemId: transaction.web_order_line_item_id,
      isRenewOrRestore,
      isFirstSubscriptionPurchase: !isRenewOrRestore,
      rawTransaction: transaction
    }
  }
}
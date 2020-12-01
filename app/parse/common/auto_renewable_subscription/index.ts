import {
  AutoRenewableSubscription,
} from "../../../result/auto_renewable_subscription"
import { ParsedTransactions } from "./transactions"
import { ParsedSubscription } from "./subscription"
import { AppleLatestReceiptInfo, ApplePendingRenewalInfo } from "types-apple-iap"

/**
 * @internal
 */
export const parseSubscriptions = (
  latestReceiptInfo?: AppleLatestReceiptInfo[],
  pendingRenewalInfo?: ApplePendingRenewalInfo[]
): AutoRenewableSubscription[] => {
  if (!latestReceiptInfo) return []

  const parsedTransactions = new ParsedTransactions()

  latestReceiptInfo
    .filter((transaction) => ParsedTransactions.isAutoRenewableSubscriptionTransaction(transaction))
    .forEach((subscription) => parsedTransactions.addTransaction(subscription))

  return Array.from(parsedTransactions.iterateParsedTransactions()).map((allTransactions) => {
    const sampleTransaction = allTransactions[0]
    const originalTransactionId = sampleTransaction.originalTransactionId
    const isEligibleIntroductoryOffer = parsedTransactions.getIsEligibleIntroductoryOffer(sampleTransaction)!

    const renewalInfo = pendingRenewalInfo?.find(
      (entry) => entry.original_transaction_id === originalTransactionId
    )

    return new ParsedSubscription(
      originalTransactionId,
      isEligibleIntroductoryOffer,
      allTransactions,
      renewalInfo
    ).parseSubscription()
  })
}

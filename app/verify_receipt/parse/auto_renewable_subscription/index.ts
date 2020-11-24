import { AppleVerifyReceiptSuccessfulResponse } from "../../apple_response/success"
import {
  AutoRenewableSubscription,
} from "../result/auto_renewable_subscription"
import { ParsedTransactions } from "./transactions"
import { ParsedSubscription } from "./subscription"

/**
 * @internal
 */
export const parseSubscriptions = (
  response: AppleVerifyReceiptSuccessfulResponse
): AutoRenewableSubscription[] => {
  if (!response.latest_receipt_info) return []

  const parsedTransactions = new ParsedTransactions()

  response.latest_receipt_info
    .filter((transaction) => ParsedTransactions.isAutoRenewableSubscriptionTransaction(transaction))
    .forEach((subscription) => parsedTransactions.addTransaction(subscription))

  return Array.from(parsedTransactions.iterateParsedTransactions()).map((allTransactions) => {
    const sampleTransaction = allTransactions[0]
    const originalTransactionId = sampleTransaction.originalTransactionId
    const isEligibleIntroductoryOffer = parsedTransactions.getIsEligibleIntroductoryOffer(sampleTransaction)!

    const renewalInfo = response.pending_renewal_info?.find(
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

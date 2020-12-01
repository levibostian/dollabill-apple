import { AppleLatestReceiptInfo, AppleInAppPurchaseTransaction } from "types-apple-iap"
import { ProductPurchases } from "../../../result"
import { ParsedPurchases } from "./transaction"

/**
 * @internal
 */
export const parsePurchases = (
  latestReceiptInfo?: AppleLatestReceiptInfo[],  
  inAppTransactions?: AppleInAppPurchaseTransaction[]    
): ProductPurchases[] => {
  if (!inAppTransactions) return []

  const parsedPurchases = new ParsedPurchases()

  inAppTransactions
    .filter((transaction) => ParsedPurchases.isPurchaseTransaction(transaction))
    .forEach((purchase) => parsedPurchases.addTransaction(purchase))

  return parsedPurchases.parse()
}

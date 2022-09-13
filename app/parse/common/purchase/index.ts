import { AppleLatestReceiptInfo, AppleInAppPurchaseTransaction } from "types-apple-iap"
import { ProductPurchases } from "../../../result"
import { ParsedPurchases } from "./transaction"

/**
 * Here, we are parsing the latest receipt info *and* in-app purchase transactions. 
 * 
 * This is because (1) I am still confused by Apple's documentation on what one to use, when. 
 * (2) the latest receipt info contains the latest transactions which is great, but the 
 * latest receipt info is only available when the receipt contains auto-renewable subscriptions. 
 * (3) This document: https://developer.apple.com/documentation/appstoreservernotifications/unified_receipt
 * says that `latest_receipt_info` only contains the latest 100 receipt transactions. So, I also want to process
 * the in_app transactions, too. 
 * 
 * @internal
 */
export const parsePurchases = (
  latestReceiptInfo?: AppleLatestReceiptInfo[],  
  inAppTransactions?: AppleInAppPurchaseTransaction[]    
): ProductPurchases[] => {
  if (!inAppTransactions || inAppTransactions.length == 0) return []
  
  const parsedPurchases = new ParsedPurchases()

  inAppTransactions.concat(latestReceiptInfo as AppleInAppPurchaseTransaction[])
    .filter((transaction) => ParsedPurchases.isPurchaseTransaction(transaction))
    .forEach((purchase) => parsedPurchases.addTransaction(purchase))

  return parsedPurchases.parse()
}

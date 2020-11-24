import { AppleVerifyReceiptSuccessfulResponse } from "../../apple_response/success"
import { ProductPurchases } from "../result"
import { ParsedPurchases } from "./transaction"

/**
 * @internal
 */
export const parsePurchases = (
  response: AppleVerifyReceiptSuccessfulResponse
): ProductPurchases[] => {
  if (!response.receipt.in_app) return []

  const parsedPurchases = new ParsedPurchases()

  response.receipt.in_app
    .filter((transaction) => ParsedPurchases.isPurchaseTransaction(transaction))
    .forEach((purchase) => parsedPurchases.addTransaction(purchase))

  return parsedPurchases.parse()
}

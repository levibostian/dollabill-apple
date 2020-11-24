import _ from "../../../underscore"
import { InternalError } from "../error"
import { AppleInAppPurchaseTransaction } from "../../apple_response/receipt"
import { ProductPurchases, ProductPurchaseTransaction } from "../result/purchase"

/**
 * Takes in a response from Apple transaction and produces a parsed transaction. Keeps track of all of them by grouping them together by subscription group.
 *
 * @internal
 */
export class ParsedPurchases {
  public transactions: Map<string, ProductPurchaseTransaction[]> = new Map()

  addTransaction(purchase: AppleInAppPurchaseTransaction): void {
    if (!ParsedPurchases.isPurchaseTransaction(purchase))
      throw new InternalError(
        "PrerequisiteNotMet",
        `Filter out all transactions that are *not* product purchase transactions before calling this function.`
      )

    const existingTransactions = this.transactions.get(purchase.product_id) || []

    existingTransactions.push(this.parseTransaction(purchase))

    this.transactions.set(purchase.product_id, existingTransactions)
  }

  static isPurchaseTransaction(transaction: AppleInAppPurchaseTransaction): boolean {
    return transaction.expires_date === undefined || transaction.expires_date === null
  }

  parse(): ProductPurchases[] {
    return Array.from(this.transactions.keys()).map((key) => {
      const transactions = this.transactions.get(key)!
      transactions.sort((first, second) =>
        _.date.sortNewToOld(first.purchaseDate, second.purchaseDate)
      )

      return {
        productId: key,
        transactions
      }
    })
  }

  private parseTransaction(transaction: AppleInAppPurchaseTransaction): ProductPurchaseTransaction {
    return {
      quantity: parseInt(transaction.quantity!),
      transactionId: transaction.transaction_id,
      purchaseDate: new Date(parseInt(transaction.purchase_date_ms)),
      rawTransaction: transaction
    }
  }
}

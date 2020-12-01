import _ from "../../../underscore"
import { ProductPurchases, ProductPurchaseTransaction } from "../../../result/purchase"
import { InternalError } from "../../../parse/verify_receipt/error"
import { AppleInAppPurchaseTransaction } from "types-apple-iap"

/**
 * Takes in a response from Apple transaction and produces a parsed transaction. Keeps track of all of them by grouping them together by subscription group.
 *
 * @internal
 */
export class ParsedPurchases {
  public transactions: Map<string, ProductPurchaseTransaction[]> = new Map()

  /**
   * Must be able to take in unlimited transactions but only add unique ones. 
   */
  addTransaction(purchase: AppleInAppPurchaseTransaction): void {
    if (!ParsedPurchases.isPurchaseTransaction(purchase))
      throw new InternalError(
        "PrerequisiteNotMet",
        `Filter out all transactions that are *not* product purchase transactions before calling this function.`
      )

    const existingTransactions = this.transactions.get(purchase.product_id) || []
    const parsedTransaction = this.parseTransaction(purchase)

    if (_.array.contains(existingTransactions, item => item.transactionId === parsedTransaction.transactionId)) return 

    existingTransactions.push(parsedTransaction)

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

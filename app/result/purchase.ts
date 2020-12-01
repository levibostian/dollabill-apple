import { AppleInAppPurchaseTransaction } from "types-apple-iap";

export interface ProductPurchaseTransaction {
  /**
   * The quantity purchased for the transaction. Mostly used for consumables.
   */
  quantity: number
  /**
   * A unique identifier for a purchase.
   */
  transactionId: string
  /**
   * When the purchase was made.
   */
  purchaseDate: Date
  rawTransaction: AppleInAppPurchaseTransaction
}

export interface ProductPurchases {
  /**
   * The product id of the product purchased. 
   */
  productId: string
  /**
   * All transactions for the given {@link productId}. 
   */
  transactions: ProductPurchaseTransaction[] 
}

import { AppleLatestReceiptInfo } from "types-apple-iap"
import { AutoRenewableSubscriptionTransaction } from "./result"

/**
 * Global jest setup/teardown functions
 */
beforeAll(async () => {
  // do setup here
})
beforeEach(async () => {
  // before each test
})
afterAll(async () => {
  // do teardown here
})
afterEach(async () => {
  // after each
})

export const parsedTransaction: AutoRenewableSubscriptionTransaction = {
  productId: "product-id",
  cancelledDate: undefined,
  refundReason: undefined,
  expiresDate: new Date('2020-11-12T17:43:50-08:00'),
  inIntroPeriod: false,
  inTrialPeriod: false,
  isUpgradeTransaction: false,
  offerCodeRefName: undefined,
  originalPurchaseDate: new Date("2020-10-12T17:43:50-08:00"),
  originalTransactionId: "0000001101010",
  promotionalOfferId: undefined,
  purchaseDate: new Date("2020-10-12T17:43:50-08:00"),
  subscriptionGroupId: "group1",
  transactionId: "230403030",
  webOrderLineItemId: undefined,
  isRenewOrRestore: true,
  isFirstSubscriptionPurchase: false,
  rawTransaction: ({} as AppleLatestReceiptInfo) // i'm lazy. not used for tests so just leave it empty.
}

export const parsedTransaction2: AutoRenewableSubscriptionTransaction = {
  productId: "product-id",
  cancelledDate: undefined,
  refundReason: undefined,
  expiresDate: new Date('2020-09-12T17:43:50-08:00'),
  inIntroPeriod: false,
  inTrialPeriod: false,
  isUpgradeTransaction: false,
  offerCodeRefName: undefined,
  originalPurchaseDate: new Date("2020-08-12T17:43:50-08:00"),
  originalTransactionId: "0000001101010",
  promotionalOfferId: undefined,
  purchaseDate: new Date("2020-08-12T17:43:50-08:00"),
  subscriptionGroupId: "group1",
  transactionId: "0000001101010",
  webOrderLineItemId: undefined,
  isRenewOrRestore: false,
  isFirstSubscriptionPurchase: true,
  rawTransaction: ({} as AppleLatestReceiptInfo) // i'm lazy. not used for tests so just leave it empty.
}

export default parsedTransaction
import { AppleVerifyReceiptErrorCode, isAppleErrorCode, isAppleResponseError } from "./error"
import { AppleVerifyReceiptSuccessfulStatus } from "./success"

describe("isAppleErrorCode", () => {
  it(`given not error, expect false`, async () => {    
    expect(isAppleErrorCode(AppleVerifyReceiptSuccessfulStatus.SUCCESS)).toEqual(false)
    expect(isAppleErrorCode(AppleVerifyReceiptSuccessfulStatus.VALID_BUT_SUBSCRIPTION_EXPIRED)).toEqual(false)
  })
  it(`given error, expect true`, async () => {
    expect(isAppleErrorCode(AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET)).toEqual(true)
  })
  it(`given random error code library not aware of`, async () => {
    expect(isAppleErrorCode(21199)).toEqual(true)
  })
})

describe("isAppleResponseError", () => {
  it(`given no receipt, expect false`, async () => {
    expect(isAppleResponseError({
      status: AppleVerifyReceiptErrorCode.NOT_POST
    })).toEqual(true)
  })
  it(`given receipt, expect true`, async () => {
    expect(isAppleResponseError(require('../../../samples/subscription_first_time_purchase.json'))).toEqual(false)
  })
})
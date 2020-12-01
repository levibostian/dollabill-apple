import { AppleError, handleErrorResponse, InternalError, isAppleErrorCode, isAppleResponseError } from "./error"
import * as constants from "../../constants"
import { AppleVerifyReceiptErrorCode, AppleVerifyReceiptSuccessfulStatus } from "types-apple-iap"

describe("InternalError", () => {
  it(`given message, expect insert bug report link`, async () => {
    const actual = new InternalError("name", "added-message")

    expect(actual.message.includes(constants.bugReportLink)).toEqual(true)
  })
  it(`given message, expect add message`, async () => {
    const actual = new InternalError("name", "added-message")

    expect(actual.message.includes("added-message")).toEqual(true)
  })
  it(`given name, expect name equal`, async () => {
    const actual = new InternalError("name", "added-message")

    expect(actual.name).toEqual("name")
  })
  it(`given no stack, expect set default`, async () => {
    const actual = new InternalError("name", "added-message")

    expect(actual.stack).toBeDefined()
  })
  it(`given given error stack, expect get error stack`, async () => {
    const stack = "fake-stack"
    const givenError: Error = {
      name: "foo",
      message: "",
      stack
    }

    const actual = InternalError.fromError(givenError)

    expect(actual.stack).toEqual(stack)
  })
})

describe("AppleError", () => {
  it(`expect includes error code`, async () => {
    const actual = new AppleError("message", AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET)
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET)
    expect(
      actual.message.includes(AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET.toString())
    ).toEqual(true)
  })
})

describe("handleErrorResponse", () => {
  it(`given successful response, expect throw internal error`, async () => {
    expect(() => {
      handleErrorResponse({
        status: 0
      })
    }).toThrow()
  })
  it(`given random number, expect apple error`, async () => {
    const code = 2020202

    const actual = handleErrorResponse({
      status: code
    }) as AppleError

    expect(actual.appleErrorCode).toEqual(code)
  })
  it(`given NOT_POST, expect internal error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.NOT_POST
    }) as InternalError

    expect(actual.name).toEqual("ShouldNotHappen")
  })
  it(`given SHOULD_NOT_HAPPEN, expect internal error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.SHOULD_NOT_HAPPEN
    }) as InternalError

    expect(actual.name).toEqual("ShouldNotHappen")
  })
  it(`given INVALID_RECEIPT_OR_DOWN, expect apple error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.INVALID_RECEIPT_OR_DOWN
    }) as AppleError

    expect(actual.message).toMatchInlineSnapshot(
      `"The receipt you sent may be malformed. Your code may have modified the receipt or this is a bad request sent by someone possibly malicious. Make sure your apps work and besides that, ignore this. (error code: 21002)"`
    )
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.INVALID_RECEIPT_OR_DOWN)
  })
  it(`given UNAUTHORIZED, expect apple error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.UNAUTHORIZED
    }) as AppleError

    expect(actual.message).toMatchInlineSnapshot(
      `"Apple said the request was unauthorized. Perhaps you provided the wrong shared secret? (error code: 21003)"`
    )
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.UNAUTHORIZED)
  })
  it(`given WRONG_SHARED_SECRET, expect apple error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET
    }) as AppleError

    expect(actual.message).toMatchInlineSnapshot(
      `"Apple said the shared secret that you provided does not match the shared secret on file for your account. Check it to make sure it's correct. (error code: 21004)"`
    )
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET)
  })
  it(`given APPLE_INTERNAL_ERROR, expect apple error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.APPLE_INTERNAL_ERROR
    }) as AppleError

    expect(actual.message).toMatchInlineSnapshot(
      `"Unknown Apple error code. This might be an internal Apple error code or one that this library simply does not know about yet. (error code: 21009)"`
    )
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.APPLE_INTERNAL_ERROR)
  })
  it(`given SERVICE_DOWN, expect apple error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.SERVICE_DOWN
    }) as AppleError

    expect(actual.message).toMatchInlineSnapshot(
      `"Sorry! Apple's service seems to be down. Try the request again later. That's all we know. (error code: 21005)"`
    )
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.SERVICE_DOWN)
  })
  it(`given CUSTOMER_NOT_FOUND, expect apple error`, async () => {
    const actual = handleErrorResponse({
      status: AppleVerifyReceiptErrorCode.CUSTOMER_NOT_FOUND
    }) as AppleError

    expect(actual.message).toMatchInlineSnapshot(
      `"Apple could not find the customer. The customer could have been deleted? (error code: 21010)"`
    )
    expect(actual.appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.CUSTOMER_NOT_FOUND)
  })
})

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

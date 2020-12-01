import { parseResponseBody, runVerifyReceipt } from "./verify_receipt"
import * as constants from "./constants"

jest.mock('tiny-json-http')
import http from "tiny-json-http"
import { AppleError } from "./parse/verify_receipt/error"
import { AppleVerifyReceiptErrorCode } from "types-apple-iap"
import { isFailure } from "."

describe("runVerifyReceipt", () => {
  it(`given apple responds saying to use testing environment, expect to use testing environment in 2nd attempt`, async () => {
    const postMock = jest.fn().mockResolvedValueOnce({
      status: AppleVerifyReceiptErrorCode.USE_TEST_ENVIRONMENT
    }).mockResolvedValueOnce(require('../samples/simple'))
    http.post = postMock

    await runVerifyReceipt({
      receipt: "",
      sharedSecret: ""
    }, {production: true})

    expect(postMock.mock.calls).toHaveLength(2)
    expect(postMock.mock.calls[0][0].url).toEqual(constants.appleProductionVerifyReceiptEndpoint)
    expect(postMock.mock.calls[1][0].url).toEqual(constants.appleSandboxVerifyReceiptEndpoint)
  })
  it(`given apple responds with non-200 response, expect receive error`, async () => {
    const givenError = new Error("Non-200")    
    const postMock = jest.fn().mockRejectedValueOnce(givenError)
    http.post = postMock

    const actual = await runVerifyReceipt({
      receipt: "",
      sharedSecret: ""
    }, {production: false})

    expect(isFailure(actual)).toEqual(true)
    expect(postMock.mock.calls).toHaveLength(1)    
  })
  it(`given an apple error response, expect receipt the error result`, async () => {
    const postMock = jest.fn().mockResolvedValueOnce({
      status: AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET
    })
    http.post = postMock

    const actual = await runVerifyReceipt({
      receipt: "",
      sharedSecret: ""
    }, {production: false})

    expect(postMock.mock.calls).toHaveLength(1)
    if (!isFailure(actual)) throw new Error('should be a failure')    
    expect((actual as AppleError).appleErrorCode).toEqual(AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET)
  })
  it(`given apple returns unknown error code, expect get an error result`, async () => {
    const postMock = jest.fn().mockResolvedValueOnce({
      status: 21199
    })
    http.post = postMock

    const actual = await runVerifyReceipt({
      receipt: "",
      sharedSecret: ""
    }, {production: false})

    expect(postMock.mock.calls).toHaveLength(1)
    if (!isFailure(actual)) throw new Error('should be a failure')    
    expect((actual as AppleError).appleErrorCode).toEqual(21199)
  })
  it(`given successful request, expect to get parsed successful result`, async () => {
    const postMock = jest.fn().mockResolvedValueOnce(require("../samples/simple.json"))
    http.post = postMock

    const actual = await runVerifyReceipt({
      receipt: "",
      sharedSecret: ""
    }, {production: false})

    expect(postMock.mock.calls).toHaveLength(1)  
    expect(isFailure(actual)).toEqual(false)
  })
})

describe("parse samples", () => {
  it(`given non consumable, given auto renewable subscription not auto renewing`, async () => {
    expect(parseResponseBody(require("../samples/bought_non_consumable.json"))).toMatchSnapshot()
  })
})

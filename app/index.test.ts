import { ParseOptions, parseServerToServerNotification, isFailure, verifyReceipt } from "."
import { AppleServerNotificationResponseBody } from "types-apple-iap"
import { NotValidNotification } from "./parse/server_to_server/error"
import { ParsedResult } from "./result"
import * as constants from "./constants"
jest.mock('tiny-json-http')
import http from "tiny-json-http"

describe("parseServerToServerNotification", () => {
  it(`given undefined shared secret, expect get error`, async () => {
    const options = {
      sharedSecret: (undefined as unknown) as string,
      responseBody: {
        password: "foo"
      } as AppleServerNotificationResponseBody
    } as ParseOptions

    const actual = parseServerToServerNotification(options)

    expect(isFailure(actual)).toEqual(true)
  })
  it(`given shared secrets do not match, expect get error`, async () => {
    const options = {
      sharedSecret: "foo",
      responseBody: {
        password: "bar"
      } as AppleServerNotificationResponseBody
    } as ParseOptions

    const actual = parseServerToServerNotification(options)

    expect(isFailure(actual)).toEqual(true)
  })
  it(`given equal shared secrets, expect get parsed notification`, async () => {
    const sample: AppleServerNotificationResponseBody = require("../samples/server_notification.json")

    const options = {
      sharedSecret: sample.password,
      responseBody: sample 
    }
    const actual = parseServerToServerNotification(options)

    expect(isFailure(actual)).toEqual(false)
  })
})

describe("isFailure", () => {
  it(`given error, expect true`, async () => {
    expect(isFailure(new NotValidNotification("foo"))).toEqual(true)
  })
  it(`given not error, expect false`, async () => {
    const result = {
      bundleId: "com.foo.foo"
    } as ParsedResult
    expect(isFailure(result)).toEqual(false)
  })
})

describe("verifyReceipt", () => {
  it(`expect use production environment by default`, async () => {
    const postMock = jest.fn().mockResolvedValueOnce(require('../samples/simple'))
    http.post = postMock

    await verifyReceipt({
      receipt: "",
      sharedSecret: ""
    })

    expect(postMock.mock.calls).toHaveLength(1)
    expect(postMock.mock.calls[0][0].url).toEqual(constants.appleProductionVerifyReceiptEndpoint)    
  })
})
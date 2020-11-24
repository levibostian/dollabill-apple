import http from "tiny-json-http"
import {
  appleProductionVerifyReceiptEndpoint,
  appleSandboxVerifyReceiptEndpoint
} from "./constants"
import {
  AppleVerifyReceiptErrorCode,
  isAppleResponseError
} from "./verify_receipt/apple_response/error"
import { AppleVerifyReceiptResponse } from "./verify_receipt/apple_response/success"
import { handleErrorResponse } from "./verify_receipt/parse/error"
import { ParsedReceipt } from "./verify_receipt/parse/result/parsed_receipt"
import { parseSuccess } from "./verify_receipt/parse/success"

interface VerifyReceiptOptions {
  production: boolean
}

const runVerifyReceipt = async (
  receipt: string,
  sharedSecret: string,
  options: VerifyReceiptOptions
): Promise<VerifyReceiptResponse> => {
    let url = appleSandboxVerifyReceiptEndpoint
    if (options.production) {
      url = appleProductionVerifyReceiptEndpoint
    }

    let verifyReceiptResponse: AppleVerifyReceiptResponse
    try {      
      verifyReceiptResponse = await http.post({
        url,
        data: {
          "receipt-data": receipt,
          password: sharedSecret
        }
      })
    } catch (httpError) { // https://github.com/brianleroux/tiny-json-http/blob/0c2b3372d8b9a838ac9a63645bf5212427c0ccf3/_write.js#L123-L126
      return {
         error: httpError
      }
    }

    if (isAppleResponseError(verifyReceiptResponse)) {
      if (verifyReceiptResponse.status == AppleVerifyReceiptErrorCode.USE_TEST_ENVIRONMENT) {
        return runVerifyReceipt(receipt, sharedSecret, { production: false })
      }

      const parsedError = handleErrorResponse(verifyReceiptResponse)

      return {
        error: parsedError
      }
    } else {
      return parseSuccess(verifyReceiptResponse)
    }
}

/**
 * Represents a failed attempt from {@link verifyReceipt}. 
 */
export type VerifyReceiptFailure = {
  error: Error
}
/**
 * The response type of {@link verifyReceipt}. A failure or a success. 
 * 
 * Make sure to use {@link isFailure} after you get this response. 
 */
export type VerifyReceiptResponse = ParsedReceipt | VerifyReceiptFailure

/**
 * Verify an in-app purchase receipt. This is a major feature of this library. 
 * 
 * This function will send the receipt to Apple's server and parse the result into something that is much more useful for you, the developer. This allow you to implement in-app purchases faster in your app with server-side verification. 
 */
export const verifyReceipt = (
  receipt: string,
  sharedSecret: string
): Promise<VerifyReceiptResponse> => {
  return runVerifyReceipt(receipt, sharedSecret, { production: true })
}

/**
 * Determine if a {@link VerifyReceiptResponse} was a failed response or a success. 
 */
export const isFailure = (response: VerifyReceiptResponse): response is VerifyReceiptFailure => {
  return (response as VerifyReceiptFailure).error !== undefined
}

export * from "./verify_receipt/parse/result"
export * from "./verify_receipt/apple_response"

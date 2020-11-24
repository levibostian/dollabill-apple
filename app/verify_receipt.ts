import http from "tiny-json-http"
import {
  appleProductionVerifyReceiptEndpoint,
  appleSandboxVerifyReceiptEndpoint
} from "./constants"
import {
  AppleVerifyReceiptErrorCode,
  isAppleResponseError
} from "./verify_receipt/apple_response/error"
import { AppleVerifyReceiptResponse, AppleVerifyReceiptSuccessfulResponse } from "./verify_receipt/apple_response/success"
import { handleErrorResponse } from "./verify_receipt/parse/error"
import { ParsedReceipt } from "./verify_receipt/parse/result/parsed_receipt"
import { parseSuccess } from "./verify_receipt/parse/success"

/**
 * If you want to perform the HTTP request yourself and just parse the verified receipt, use this function. 
 */
export const parseResponseBody = (response: AppleVerifyReceiptSuccessfulResponse): ParsedReceipt => {
  return parseSuccess(response)
}

const runVerifyReceipt = async (options: VerifyReceiptOptions, runOptions: {production: boolean}): Promise<VerifyReceiptResponse> => {
    let url = appleSandboxVerifyReceiptEndpoint
    if (runOptions.production) {
      url = appleProductionVerifyReceiptEndpoint
    }

    let verifyReceiptResponse: AppleVerifyReceiptResponse
    try {      
      verifyReceiptResponse = await http.post({
        url,
        data: {
          "receipt-data": options.receipt,
          password: options.sharedSecret,
          "exclude-old-transactions": false // we always send false because the parsed results that this module makes will be missing lots of data without *all* of the transactions. The value of this module goes down a lot and you will get false positives since many fields such as *is eligible for intro offer* will probably show true when it's actually false. 
        }
      })
    } catch (httpError) { // https://github.com/brianleroux/tiny-json-http/blob/0c2b3372d8b9a838ac9a63645bf5212427c0ccf3/_write.js#L123-L126
      return {
         error: httpError
      }
    }

    if (isAppleResponseError(verifyReceiptResponse)) {
      if (verifyReceiptResponse.status == AppleVerifyReceiptErrorCode.USE_TEST_ENVIRONMENT) {
        return runVerifyReceipt(options, { production: false })
      }

      const parsedError = handleErrorResponse(verifyReceiptResponse)

      return {
        error: parsedError
      }
    } else {
      return parseResponseBody(verifyReceiptResponse)
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
 * Parameters passed to {@link verifyReceipt}. 
 */
export interface VerifyReceiptOptions {
  /**
   * Receipt you got from StoreKit in your app. base64 encoded string. 
   */
  receipt: string
  /**
   * Shared secret you have set inside of App Store Connect. 
   */
  sharedSecret: string  
}

/**
 * Verify an in-app purchase receipt. This is a major feature of this library. 
 * 
 * This function will send the receipt to Apple's server and parse the result into something that is much more useful for you, the developer. This allow you to implement in-app purchases faster in your app with server-side verification. 
 */
export const verifyReceipt = (options: VerifyReceiptOptions): Promise<VerifyReceiptResponse> => {
  return runVerifyReceipt(options, { production: true })
}

/**
 * Determine if a {@link VerifyReceiptResponse} was a failed response or a success. 
 */
export const isFailure = (response: VerifyReceiptResponse): response is VerifyReceiptFailure => {
  return (response as VerifyReceiptFailure).error !== undefined
}

export * from "./verify_receipt/parse/result"
export * from "./verify_receipt/apple_response"

import http from "tiny-json-http"
import { VerifyReceiptOptions, ParseResult } from "."
import { ParsedResult } from "./result/parsed_result"
import {
  appleProductionVerifyReceiptEndpoint,
  appleSandboxVerifyReceiptEndpoint
} from "./constants"
import {
  isAppleResponseError
} from "./parse/verify_receipt/error"
import { AppleVerifyReceiptResponseBodySuccess, AppleVerifyReceiptResponseBody, AppleVerifyReceiptErrorCode } from "types-apple-iap"
import { handleErrorResponse } from "./parse/verify_receipt/error"
import { parseSuccess } from "./parse/verify_receipt/success"

/**
 * If you want to perform the HTTP request yourself and just parse the verified receipt, use this function. 
 */
export const parseResponseBody = (response: AppleVerifyReceiptResponseBodySuccess): ParsedResult => {
  return parseSuccess(response)
}

export const runVerifyReceipt = async (options: VerifyReceiptOptions, runOptions: {production: boolean}): Promise<ParseResult> => {
    let url = appleSandboxVerifyReceiptEndpoint
    if (runOptions.production) {
      url = appleProductionVerifyReceiptEndpoint
    }

    let verifyReceiptResponse: AppleVerifyReceiptResponseBody
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
      return httpError
    }

    if (isAppleResponseError(verifyReceiptResponse)) {
      if (verifyReceiptResponse.status == AppleVerifyReceiptErrorCode.USE_TEST_ENVIRONMENT) {
        return runVerifyReceipt(options, { production: false })
      }

      const parsedError = handleErrorResponse(verifyReceiptResponse)

      return parsedError
    } else {
      return parseResponseBody(verifyReceiptResponse)
    }
}
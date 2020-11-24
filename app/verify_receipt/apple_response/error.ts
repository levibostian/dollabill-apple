import { AppleVerifyReceiptResponse, AppleVerifyReceiptSuccessfulStatus } from "./success"

/**
 * All of the statuses that are not successful. Apple was not able to provide back receipt information.
 *
 * [Official Apple documentation](https://developer.apple.com/documentation/appstorereceipts/status)
 * 
 * > Note: There may be many more error codes then these. These are ones that are documented but Apple says that there are also codes in the range 21100-21199 that could be returned. 
 */
export enum AppleVerifyReceiptErrorCode {
  NOT_POST = 21000,
  SHOULD_NOT_HAPPEN = 21001,
  INVALID_RECEIPT_OR_DOWN = 21002,
  UNAUTHORIZED = 21003,
  WRONG_SHARED_SECRET = 21004,
  SERVICE_DOWN = 21005,
  USE_TEST_ENVIRONMENT = 21007,
  USE_PRODUCTION_ENVIRONMENT = 21008,
  APPLE_INTERNAL_ERROR = 21009,
  CUSTOMER_NOT_FOUND = 21010
}

/**
 * The response body of a request that had an error. The receipt was not decoded and returned.
 */
export interface AppleVerifyReceiptErrorResponse {
  /**
   * > Note: Type here is `number` because the status can be more then the options included in {@link AppleVerifyReceiptErrorCode}. 
   * 
   * See {@link AppleVerifyReceiptErrorCode} for documented options. 
   */
  status: number
}

/**
 * @internal
 */
export const isAppleResponseError = (
  response: AppleVerifyReceiptResponse
): response is AppleVerifyReceiptErrorResponse => { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response as any).receipt === undefined
}

/**
 * @internal
 */
export const isAppleErrorCode = (
  code: number 
): boolean => {  
  // Important that we only check if successful codes because there are a finite number of successful codes and unlimited error codes.   
  return !Object.values(AppleVerifyReceiptSuccessfulStatus).includes(code)
}

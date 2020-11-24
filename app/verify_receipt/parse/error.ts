import { AppleVerifyReceiptErrorCode, isAppleErrorCode } from "../apple_response/error"
import { AppleVerifyReceiptErrorResponse } from "../apple_response/error"
import { bugReportLink } from "../../constants"

/**
 * Parses the HTTP response and returns back an Error meant for a developer's purpose. These errors below are meant to be more friendly to help the developer fix the issue. 
 * 
 * @internal
 */
export const handleErrorResponse = (response: AppleVerifyReceiptErrorResponse): Error => {
  const code = response.status

  if (!isAppleErrorCode(code)) throw new InternalError("ShouldNotHappen", "Function should only be called with statuses that are errors.")

  switch (code) {
    case AppleVerifyReceiptErrorCode.NOT_POST:
      return new InternalError(
        "ShouldNotHappen",
        "Error should not happen. Apple expects a correctly formatted HTTP POST which, we perform on your behalf."
      )
    case AppleVerifyReceiptErrorCode.SHOULD_NOT_HAPPEN:
      return new InternalError(
        "ShouldNotHappen",
        "Apple's documentation says this response code is no longer being used. Should not happen."
      )
    case AppleVerifyReceiptErrorCode.INVALID_RECEIPT_OR_DOWN:
      return new AppleError(
        "The receipt you sent may be malformed. Your code may have modified the receipt or this is a bad request sent by someone possibly malicious. Make sure your apps work and besides that, ignore this.",
        code
      )
    case AppleVerifyReceiptErrorCode.UNAUTHORIZED:
      return new AppleError(
        "Apple said the request was unauthorized. Perhaps you provided the wrong shared secret?",
        code
      )
    case AppleVerifyReceiptErrorCode.WRONG_SHARED_SECRET:
      return new AppleError(
        "Apple said the shared secret that you provided does not match the shared secret on file for your account. Check it to make sure it's correct.",
        code
      )
    case (AppleVerifyReceiptErrorCode.APPLE_INTERNAL_ERROR,
    AppleVerifyReceiptErrorCode.SERVICE_DOWN):
      return new AppleError(
        `Sorry! Apple's service seems to be down. Try the request again later. That's all we know.`,
        code
      )
    case AppleVerifyReceiptErrorCode.CUSTOMER_NOT_FOUND:
      return new AppleError(
        "Apple could not find the customer. The customer could have been deleted?",
        code
      )
  }

  return new AppleError(
    "Unknown Apple error code. This might be an internal Apple error code or one that this library simply does not know about yet.",
    code
  )
}

/**
 * An error came back from Apple. Apple's server returns back an error code. This class is an Error wrapper for that code to be returned to the developer. 
 */
export class AppleError extends Error {
  constructor(message: string, public appleErrorCode: AppleVerifyReceiptErrorCode) {
    super(`${message} (error code: ${appleErrorCode})`)
  }
}

/**
 * An error happened in the library itself. This Error type should not be used by a developer using this library. If this error gets thrown, it means you should open a bug report so we can fix the library. 
 * 
 * Goals of this class:
 * 1. Prompt the developer to file a bug report.
 * 2. Include in this error all of the information from the given error so we can fix the issue.
 */
export class InternalError implements Error {
  public name: string
  public message: string
  public stack: string

  constructor(name: string, message: string, stack?: string) {
    this.stack = stack || new Error().stack!

    this.name = name
    this.message = `BUG! Please, file a bug report: ${bugReportLink}. (${message})`
  }

  static fromError(error: Error): InternalError {
    const errorCopy = error
    const stack = error.stack!

    // so when we do stringify(), we don't include the stack.
    delete errorCopy.stack

    return new InternalError(error.name, JSON.stringify(errorCopy), stack)
  }
}

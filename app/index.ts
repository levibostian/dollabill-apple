import { ParsedResult } from "./result/parsed_result"
import { AppleServerNotificationResponseBody } from "types-apple-iap"
import { NotValidNotification } from "./parse/server_to_server/error"
import  { parseSuccess as parseNotification } from "./parse/server_to_server/success"
import {runVerifyReceipt } from "./verify_receipt"

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
 * The response type of {@link verifyReceipt}. A failure or a success. 
 * 
 * Make sure to use {@link isFailure} after you get this response. 
 */
export type ParseResult = ParsedResult | Error 

/**
 * Verify an in-app purchase receipt. This is a major feature of this library. 
 * 
 * This function will send the receipt to Apple's server and parse the result into something that is much more useful for you, the developer. This allow you to implement in-app purchases faster in your app with server-side verification. 
 */
export const verifyReceipt = (options: VerifyReceiptOptions): Promise<ParseResult> => {
  return runVerifyReceipt(options, { production: true })
}

/**
 * Determine if a {@link VerifyReceiptResponse} was a failed response or a success. 
 */
export const isFailure = (response: ParseResult): response is Error => {
  return (response as ParsedResult).bundleId === undefined
}

export interface ParseOptions {
  responseBody: AppleServerNotificationResponseBody
  sharedSecret: string 
}

/**
 * If you want to perform the HTTP request yourself and just parse the verified receipt, use this function. 
 * 
 * **Warning:** This function does not have error handling involved when you pass in an object that is *not* from Apple. It's assumed you will only ever pass in an object from Apple. 
 */
export const parseServerToServerNotification = (options: ParseOptions): ParseResult  => {  
    if (options.sharedSecret === undefined || (options.sharedSecret !== options.responseBody.password)) return new NotValidNotification("The shared secret provided in server notification does not match the secret passed in. This either means you, the developer, made a mistake or this notification is *not* actually from Apple and can be ignored.")

    return parseNotification(options.responseBody)
}

export * from "./result"
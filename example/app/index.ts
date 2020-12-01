/* eslint-disable @typescript-eslint/no-var-requires */
import {verifyReceipt, isFailure, AutoRenewableSubscription, parseServerToServerNotification, ParsedResult} from "dollabill-apple"
import { AppleServerNotificationResponseBody } from "types-apple-iap"

const secrets: {
  receipt: string
  shared_secret: string 
} = require("../secrets.json")

// dollabill produces the same result when verifying receipts *and* 
// parsing server-to-server notifications. This means you can re-use
// your app's logic for handling the result of each!
const handleSuccessfulResult = (result: ParsedResult): void => {
  const subscriptions: AutoRenewableSubscription[] = result.autoRenewableSubscriptions
  // You shouldn't need to, but you can access the raw response from Apple. 
  // Hopefully, dollabill has parsed enough helpful information for you that you don't need to use this. It's here just in case. 
  result.rawResponse

  console.log(`App where purchase was made: ${result.bundleId}`)

  // API for subscription: https://levibostian.github.io/dollabill-apple/api/interfaces/autorenewablesubscription.html
  subscriptions.forEach(subscription => {
    // It's up to you to write all of the code needed to update your customer's subscription statuses. At this time, Apple recommended you maintain a database stored with:
    // 1. The original transaction id for each subscription: 
    console.log(subscription.originalTransactionId)
    // 2. The current end date that the subscription is valid for. You can use: 
    console.log(subscription.expireDate)
    // but this does not account for grace periods or refund/cancellations. Dolla bill provides a convenient Date property instead:
    console.log(subscription.currentEndDate)
    // 3. Keep track if the customer is eligible for a subscription offer or not. 
    console.log(subscription.isEligibleIntroductoryOffer)
    // Eligibility for intro offers is grouped by the subscription group, not by the original transaction id. So make sure you keep track of the subscription group, too:
    console.log(subscription.subscriptionGroup)
    // 4. Keep the latest receipt in case you need to call `verifyReceipt()` in the future to get a status of the customer's subscription:
    console.log(result.latestReceipt)
    
    // Beyond these basics, there are more advanced things you can do. Some things to help reduce the number of customers leaving your subscription.
    console.log(subscription.issues.notYetAcceptingPriceIncrease) // Customer has been notified about price increase but not accepting it yet. 
    console.log(subscription.issues.willVoluntaryCancel)          // Customer will not automatically renew 
    console.log(subscription.issues.billingIssue)                 // Customer is having billing issues with renewing. 

    console.log(subscription.status) // Gives a status telling you quickly what state the subscription is in. 
  })
}

Promise.resolve()
.then(async() => {  
  const appleResponse = await verifyReceipt({
    receipt: secrets.receipt,
    sharedSecret: secrets.shared_secret
  })

  console.log(JSON.stringify(appleResponse))  

  if (isFailure(appleResponse)) {
      // There was a problem. The receipt was not valid, the shared secret you passed in didn't match. The receipt is not valid. Apple's servers were down. 
      // It's recommended that you, the developer, log the error. We have tried to make the error messages developer friendly to help you fix the problem. 
      // It's *not* recommended that you return the error to your customer. You should return back your own message as the error here is not human friendly. 

      console.error(appleResponse)
  } else {
      // The receipt has been verified by Apple and parsed by the module! Yay!

      // API reference for the result object: https://levibostian.github.io/dollabill-apple/api/interfaces/parsedreceipt.html

      // Time for you to update your database with the status of your customer and their subscription.
      // This is easy because dolla bill parses the response from Apple to be easily readable.
      // Check out the API documentation to learn about what `appleResponse` properties there are.

      handleSuccessfulResult(appleResponse)
  }

  console.log(`-------------------------------------`)
  console.log(`Server to server notification parsing`)

  const notification: AppleServerNotificationResponseBody = require("../../samples/server_notification.json")

  const parsedResult = parseServerToServerNotification({
    sharedSecret: "foo",
    responseBody: notification
  })

  if (isFailure(parsedResult)) {
    // There was a problem. More then likely the shared secret you provided does not match the one in the notification. This means you, the developer, made a typo or there is a malicious person trying to send you fake notifications. 

    console.error(parsedResult)
  } else {
    // The notification has been parsed successfully!

    // The result type is the same as the result type of `verifyReceipt()` which means that you can 
    // re-use the same logic in your app to update the customer's subscription status! 
    handleSuccessfulResult(parsedResult)
  }
}).catch((error) => {
  console.log(error)
})

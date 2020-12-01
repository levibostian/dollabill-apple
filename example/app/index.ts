import {verifyReceipt, isFailure, AutoRenewableSubscription} from "dollabill-apple"
import { AppleReceipt, AppleVerifyReceiptResponseBodySuccess } from "types-apple-iap"

/* eslint-disable @typescript-eslint/no-var-requires */
const secrets: {
  receipt: string
  shared_secret: string 
} = require("../secrets.json")
/* eslint-enable @typescript-eslint/no-var-requires */

Promise.resolve()
.then(async() => {  
  const appleResponse = await verifyReceipt({
    receipt: secrets.receipt,
    sharedSecret: secrets.shared_secret
  })

  console.log(JSON.stringify(appleResponse))  

  if (isFailure(appleResponse)) {
      // There was a problem. The request was valid and can be retried.

      // look at the error and act on it however you wish.
      // It's recommended that you log the error and then return back a message to your users saying there was a problem. The error here is meant for the developer to see, not a good error to return back to the user.

      appleResponse
  } else {
      // Time for you to update your database with the status of your customer and their subscription.
      // This is easy because dolla bill parses the response from Apple to be easily readable.
      // Check out the API documentation to learn about what `appleResponse` properties there are.

      const subscriptions: AutoRenewableSubscription[] = appleResponse.autoRenewableSubscriptions
      const receipt: AppleReceipt = (appleResponse.rawResponse as AppleVerifyReceiptResponseBodySuccess).receipt

      console.log(`App where purchase was made: ${receipt.bundle_id}`)      

      subscriptions.forEach(subscription => {
        subscription.currentEndDate
      })
  }
}).catch((error) => {
  console.log(error)
})

import {verifyReceipt, isFailure, AutoRenewableSubscription, AppleReceipt} from "dollabill-apple/verify_receipt"

Promise.resolve()
.then(async() => {
  const appleResponse = await verifyReceipt({
    receipt: "",
    sharedSecret: ""
  })

  if (isFailure(appleResponse)) {
      // There was a problem. The request was valid and can be retried.

      // look at the error and act on it however you wish.
      // It's recommended that you log the error and then return back a message to your users saying there was a problem. The error here is meant for the developer to see, not a good error to return back to the user.

      appleResponse.error
  } else {
      // Time for you to update your database with the status of your customer and their subscription.
      // This is easy because dolla bill parses the response from Apple to be easily readable.
      // Check out the API documentation to learn about what `appleResponse` properties there are.

      const subscriptions: AutoRenewableSubscription[] = appleResponse.autoRenewableSubscriptions
      const appleReceipt: AppleReceipt = appleResponse.rawResponse.receipt

      console.log(`App where purchase was made: ${appleReceipt.bundle_id}`)      

      subscriptions.forEach(subscription => {
        subscription.currentEndDate
      })
  }
})


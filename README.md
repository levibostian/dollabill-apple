![npm (tag)](https://img.shields.io/npm/v/dollabill-apple/beta)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/levibostian/dollabill-apple/Test/beta)
[![codecov](https://codecov.io/gh/levibostian/dollabill-apple/branch/beta/graph/badge.svg?token=aVY76EstWN)](https://codecov.io/gh/levibostian/dollabill-apple)

# dolla bill

Easily work with Apple in-app purchases. So you can more easily collect your "Dolla dolla bills, ya'll".

dolla bill makes it *very* easy to...
* Verify receipts from StoreKit 
* Process server-to-server notifications 

> Note: If you have already written the code to verify receipts from Apple, you may be interested in [Typescript type definitions for Apple's responses](https://github.com/levibostian/types-apple-iap/). 

# What is dolla bill?

When implementing Apple in-app purchase receipt validation, it takes quite a bit of work (especially auto-renewable subscriptions!). There are many steps:
1. Implementing StoreKit in your app to allow your customers to make purchases. 
2. Implement *server side validation* of Receipts to validate the transactions are not fake and unlock access to paid content to your customers. 
3. If offering auto-renewable subscriptions, you need to continuously keep track of the status of your customers and give them or restrict access to paid content as time goes on. This requires you have your own database of customers on your backend server. 

dolla bill takes care of step #2 above. From my experience, step #2 is the most work and biggest pain! 

Dolla bill helps you to:
* Perform the HTTP request to Apple's servers. 
* If an error happens, dolla bill processes errors and returns back a helpful error message to you, the developer, to help you fix the problem for easily.  
* Parse successful responses from Apple into a *very handy* API for you to use. 

Example: Let's say that you need to determine if a customer is eligible to receive a discount on a new subscription.

Before dolla bill...
```ts
const transactions = parseAppleResponse(responseBody).transactions // parse Apple HTTP response to get transactions 
const subscriptions = transactions.filter(...) // get only the subscription transactions
const subscriptionGroups = ... // group all of the subscriptions into different groups 
const isSubscriptionGroupEligibleForDiscount = subscriptionGroups.transactions.forEach(transaction => transaction.in_trial_period)
```
*Note: The code above is pseudocode. The real code is at least double the amount of work*

After dolla bill...
```ts
dollaBillResponse.autoRenewableSubscriptions[0].isEligibleIntroductoryOffer
```

dolla bill parsed the results back from Apple and just hands to you  the info that you actually care about. 

That's just 1 example. You also need to write code to determine...
* Is my customer in a grace period? If so, how long?
* Is my customer beyond a grace period but still in billing retry?
* Will my customer auto-renew their subscription? 
* ... and many more

# Why use dolla bill?

When you are accepting in-app purchases in an iOS mobile app, you need to verify the transaction and continuously update your customer's subscription status. This verification and parsing of the responses back from Apple is boilerplate. This small module exists to help you with these tasks.

- [x] **No dependencies**. This module tries to be as small as possible.
- [x] **Fully tested**. Automated testing (with high test coverage) + QA testing gives you the confidence that the module will work well for you. [![codecov](https://codecov.io/gh/levibostian/dollabill-apple/branch/beta/graph/badge.svg?token=aVY76EstWN)](https://codecov.io/gh/levibostian/dollabill-apple)
- [x] **Complete API documentation** to more easily use it in your code.
- [x] **Up-to-date** If and when Apple changes the way you perform verification or Apple adds more features to verification, update this module and your projects can take advantage of the changes quickly and easily.
- [x] **Typescript typings** This project is written in Typescript for that strict typing goodness.

> Note: Technically there is [one dependency](https://github.com/brianleroux/tiny-json-http) but it's a _tiny wrapper around a built-in nodejs feature_. This module still remains super small with this.

# Getting started

#### Verify Receipt

1. First, you need to send the receipt that StoreKit has given you to dollabill for verifying:

```ts
import {verifyReceipt, isFailure, AutoRenewableSubscription} from "dollabill-apple"
// Note: The typescript typings for the raw Apple responses are in the npm module: types-apple-iap
// Full API documentation is also available for those typings: https://github.com/levibostian/types-apple-iap/#documentation
import { AppleReceipt } from "types-apple-iap"

const receiptFromStoreKit = // base64 encoded string StoreKit has given you in your app. 

// It's optional to wrap verifyReceipt() in a try/catch. 
// If an error is thrown, more then likely it's a bug with our module, not your code. 
// All errors that *could* happen are caught for you and returned from the Promise.
const appleResponse = await verifyReceipt({
  receipt: receiptFromStoreKit,
  sharedSecret: process.env.APP_STORE_CONNECT_SHARED_SECRET // https://stackoverflow.com/a/56128978/1486374
})

if (isFailure(appleResponse)) { 
  // There was a problem. The receipt was not valid, the shared secret you passed in didn't match. The receipt is not valid. Apple's servers were down. 
  // It's recommended that you, the developer, log the error. We have tried to make the error messages developer friendly to help you fix the problem. 
  // It's *not* recommended that you return the error to your customer. You should return back your own message as the error here is not human friendly. 
} else {
  // The receipt has been verified by Apple and parsed by the module! Yay!

  // API reference for the result object: https://levibostian.github.io/dollabill-apple/api/interfaces/parsedreceipt.html

  // Time for you to update your database with the status of your customer and their subscription.
  // This is easy because dolla bill parses the response from Apple to be easily readable.
  // Check out the API documentation to learn about what `appleResponse` properties there are.

  handleSuccessfulResult(appleResponse)
}
```

2. Then, you need to write all of your logic for handling the response from dollabill. 

```ts
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
    subscription.originalTransactionId
    // 2. The current end date that the subscription is valid for. You can use: 
    subscription.expireDate
    // but this does not account for grace periods or refund/cancellations. Dolla bill provides a convenient Date property instead:
    subscription.currentEndDate
    // 3. Keep track if the customer is eligible for a subscription offer or not. 
    subscription.isEligibleIntroductoryOffer
    // Eligibility for intro offers is grouped by the subscription group, not by the original transaction id. So make sure you keep track of the subscription group, too:
    subscription.subscriptionGroup
    // 4. Keep the latest receipt in case you need to call `verifyReceipt()` in the future to get a status of the customer's subscription:
    result.latestReceipt
    
    // Beyond these basics, there are more advanced things you can do. Some things to help reduce the number of customers leaving your subscription.
    subscription.issues.notYetAcceptingPriceIncrease // Customer has been notified about price increase but not accepting it yet. 
    subscription.issues.willVoluntaryCancel          // Customer will not automatically renew 
    subscription.issues.billingIssue                 // Customer is having billing issues with renewing. 

    subscription.status // Gives a status telling you quickly what state the subscription is in. 
  })
}
```


```ts

```

#### Server-to-server notification 

Super easy, especially if you have already written your code for verifying receipts. 

```ts
// Note: The typescript typings for the raw Apple responses are in the npm module: types-apple-iap
// Full API documentation is also available for those typings: https://github.com/levibostian/types-apple-iap/#documentation
import { AppleServerNotificationResponseBody } from "types-apple-iap"

const notification: AppleServerNotificationResponseBody = // server notification sent to you by Apple 

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
```

# Documentation

Full API documentation is hosted [here](https://levibostian.github.io/dollabill-apple/api/). The documentation, as of now, is a little busy because it includes all code including internal code not meant for you to use. 

Convenient quick links:
* [Result type for `verifyReceipt()` and `parseServerToServerNotification()`](https://levibostian.github.io/dollabill-apple/api/interfaces/parsedreceipt.html)
* [Auto-renewable subscription](https://levibostian.github.io/dollabill-apple/api/interfaces/autorenewablesubscription.html)
* [Product purchase (consumable, non-consumable, not auto-renewing subscription)](https://levibostian.github.io/dollabill-apple/api/interfaces/productpurchase.html)

# Tests

### Debug in VSCode

The example project is setup to be debuggable. 

First, run `npm run build` to build the module. The example requires it. Then, you can go into the debugger view in VSCode and run "Debug example" task. It will trigger breakpoints in the module code *or* the example code. 

### Automated tests

```
npm run test
```

### QA testing

* First, you need a receipt. To get that, you need a paid Apple developer membership account (because you cannot generate a Receipt without access to App Store Connect). 

To create a Receipt, follow these steps:
1. Go into App Store Connect and create an example app if you do not have one already. Create subscriptions, consumables, etc. Whatever you want. Also set a shared secret which is found in the subscriptions section of your app in App Store Connect.
2. [Download and run the example iOS app from Apple](https://developer.apple.com/documentation/storekit/in-app_purchase/offering_completing_and_restoring_in-app_purchases)

Find this code in the app:
```swift
    func paymentQueue(_ queue: SKPaymentQueue,updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
          switch transaction.transactionState {
              case .purchased: // <-------- This line is what we are looking for
          }
        }
        //Handle transaction states here.
    }
```

Add this code:

```swift
case .purchased: // <----------- This case is what we are adding to.
if let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
    FileManager.default.fileExists(atPath: appStoreReceiptURL.path) {

    do {
        let rawReceiptData = try Data(contentsOf: appStoreReceiptURL)
        let receipt = rawReceiptData.base64EncodedString(options: [])

        print("Receipt: \(receipt)")
        
        queue.finishTransaction(transaction)        
    }
    catch { print("Couldn't read receipt data with error: " + error.localizedDescription) }
}  
```
 
3. Run the example app on your computer in simulator or device as a development build. Make a purchase. You will see in the XCode console a line `Receipt: XXXXXXX`. Copy the very long string that is printed. That's your receipt. 

4. Run: `cp example/secrets.json.example example/secrets.json` and then go into `example/secrets.json` and edit it to your receipt and shared secret you just got. 

5. Time to run the QA test! Pretty easy. 

```sh
npm run qa:setup # You only need to run this once for setup.
npm run qa       # Run the actual test 
```

You should expect the script to output to the console JSON of the parsed result. 

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key))

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/levibostian"><img src="https://avatars1.githubusercontent.com/u/2041082?v=4" width="100px;" alt=""/><br /><sub><b>Levi Bostian</b></sub></a><br /><a href="https://github.com/levibostian/Purslane/commits?author=levibostian" title="Code">💻</a> <a href="https://github.com/levibostian/Purslane/commits?author=levibostian" title="Documentation">📖</a> <a href="#maintenance-levibostian" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

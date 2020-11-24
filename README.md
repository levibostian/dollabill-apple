# dolla bill

Easily work with Apple in-app purchases. So you can more easily collect your "Dolla dolla bills, ya'll".

# What is dolla bill?

When implementing Apple in-app purchase receipt validation, it takes quite a bit of work (especially auto-renewable subscriptions!). There are many steps:
1. Implementing StoreKit in your app to allow your customers to make purchases. 
2. Implement server validation to validate the transactions are not fake and unlock access to paid content to your customers. 
3. If offering auto-renewable subscriptions, you need to continuously keep track of the status of your customers and give them or restrict access to paid content as time goes on. This requires you have your own database of customers on your backend server. 

dolla bill takes care of step #2 above. From my experience, step #2 is the most work and biggest pain! 

Dolla bill helps you to:
* Perform the HTTP request to Apple's servers. 
* Process errors and returns back a helpful error message to you, the developer, to help you fix the problem. 
* Process successful responses into a very convenient set of Objects that make working with in-app purchases *finally easy*. We do all of the processing for you. 

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

That's just 1 example. You also need to write code to determine...
* Is my customer in a grace period? If so, how long?
* Is my customer beyond a grace period but still in billing retry?
* Will my customer auto-renew their subscription? 
* ... and many more

Not only that, but dolla bill has some great test coverage 😄: [![codecov](https://codecov.io/gh/levibostian/dollabill-apple/branch/master/graph/badge.svg?token=aVY76EstWN)](https://codecov.io/gh/levibostian/dollabill-apple)

# Why use dolla bill?

When you are accepting in-app purchases in an iOS mobile app, you need to verify the transaction and continuously update your customer's subscription status. This verification and parsing of the responses back from Apple is boilerplate. This small module exists to help you with these tasks.

- [x] **No dependencies**. This module tries to be as small as possible.
- [x] **Fully tested**. Automated testing (with high test coverage) + QA testing gives you the confidence that the module will work well for you.
- [x] **Complete API documentation** to more easily use it in your code.
- [x] **Up-to-date** If and when Apple changes the way you perform verification or Apple adds more features to verification, update this module and your projects can take advantage of the changes quickly and easily.
- [x] **Typescript typings** This project is written in Typescript for that strict typing goodness.

> Note: Technically there is [one dependency](https://github.com/brianleroux/tiny-json-http) but it's a _tiny wrapper around a built-in nodejs feature_. This module still remains super small with this.

# Getting started

```ts
import dollaBill from "dollabill"

const receiptFromStoreKit = // The base64 encoded receipt data that StoreKit gave your app

const appleResponse = await dollaBill.verifyReceipt({
    appPassword: process.env.APPLE_IN_APP_PURCHASE_PASSWORD,
    receipt: receiptFromStoreKit
})

// If an error happens, it's fatal. It means that there is a bug with this library (create a GitHub issue with stacktrace and other info, please) or you the developer made a mistake when using this library.

// It's recommended that you, the developer, views the error message and stacktrace to fix the issue. Note: The error here is not meant to be shown to your users.

if (!appleResponse.isValid) {
    // There was a problem. The request was valid and can be retried.

    // look at the error and act on it however you wish.
    // It's recommended that you log the error and then return back a message to your users saying there was a problem. The error here is meant for the developer to see, not a good error to return back to the user.
    appleResponse.error
} else {
    // Time for you to update your database with the status of your customer and their subscription.
    // This is easy because dolla bill parses the response from Apple to be easily readable.
    // Check out the API documentation to learn about what `appleResponse` properties there are.
}
```

# Documentation

// TODO

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

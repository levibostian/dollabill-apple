# dolla bill

Easily work with Apple in-app purchases. So you can more easily collect your "Dolla dolla bills, ya'll"

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

```ts
type Response = AppleResponse | AppleError

enum AppleErrorType {}
// TODO

type AppleError = {
  code: number
  type: AppleErrorType
}

type AppleResponse = {
  isValid: boolean
  autoRenewableSubscription?: AutoRenewableSubscription // If your in-app purchase is for auto renewable subscriptions, go here.
  decodedReceipt: Receipt
  raw: any // just in case you need it, here is the raw JSON response from Apple. https://developer.apple.com/documentation/appstorereceipts/responsebody
}

type AutoRenewableSubscription = {
  transactions: Array<Transaction>
  pendingRenewals: Array<PendingRenewal>
  isGracePeriod: bool
  gracePeriod: GracePeriodInfo
}

type GracePeriodInfo = {
  // TODO
  // make this up. it comes from: https://developer.apple.com/documentation/appstorereceipts/responsebody/pending_renewal_info
}

type PendingRenewal = {
  // TODO
  // https://developer.apple.com/documentation/appstorereceipts/responsebody/pending_renewal_info
}

type Transaction = {
  // TODO
  // https://developer.apple.com/documentation/appstorereceipts/responsebody/latest_receipt_info
}

type Receipt = {
  // TODO
  // https://developer.apple.com/documentation/appstorereceipts/responsebody/receipt
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

# CHANGELOG

## 2.2.4

* Fixed bug with auto re-subscribing when `clearDataOnReconnection=true` (default).
  Pseudo removing messages arrived later than the first subscription. It was causing
  possible data loss.
* Fixex bug with resolving `clearData()`.
* Updated `simpleddp-core` package.
* Small changes in plugin system, added event `clientReady`.

## 2.2.3

* Fixed bug with `ddpSubscription.restart` and `ddpSubscription.nosub` when error comes from the server.

## 2.2.2

* Fixed bug with `maxTimeout`.

## 2.2.1

* Fixed bug with `ddpReactiveCollection` sorting. In some cases data array didn't recieve valid updates.

## 2.2.0

* `restartSubsOnConnect` method renamed to `restartSubs`.
* Added property `clearDataOnReconnection` to `simpleDDP` class constructor.
* Docs improvments.

## 2.1.1

* Fixed bug with `ddpSubscription` restart (loosing arguments).
* Fixed rare situation with *ddp* message *removed* arriving before any other.
* API fix.

## 2.1.0

* Fixed dependencies vulnerabilities.
* Added documentation for custom EJSON types.
* Added `maxTimeout` to support the maximum wait for a response from the server to the method call.

## 2.0.2

* Fixed dependencies vulnerabilities.

## 2.0.1

* Fix. If `change` message arrives and no collection is found `simpleddp` acts like it is an `added` message.

## 2.0.0

* Added semantic versioning.
* `call` renamed to `apply`.
* New `call` works like `apply` but accepts parameters for server method as a list of function arguments.
* `subid` property of the subscription object renamed to `subscriptionId`.
* Added `subscribe` method. Works like `sub` but accepts parameters for server publication as a list of function arguments.

## 1.2.3

* Updated `simpleddp-core` package.

## 1.2.2

* Fixed bug with EJSON types.

## 1.2.1

* Updated `simpleddp-core` package.
* Added support for putting method call at the beginning of the requests queue.

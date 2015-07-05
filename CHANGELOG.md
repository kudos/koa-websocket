# Changelog

Note: koa-websockets follows semver.

## v1.0.0

### Improvements

* Expose koa context object instead of socket as `this`, attach active ws socket to context object on `websocket`.

### Bugs

* Fix ws urls containing query parameters.

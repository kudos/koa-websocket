# Changelog

Note: koa-websockets follows semver.

## v2.0.0

### Improvements

* Bump ws major for DoS fix.

## v1.1.0

### Improvements

* Bump ws for iojs 3.

## v1.0.0

### Improvements

* Expose koa context object instead of socket as `this`, attach active ws socket to context object on `websocket`.

### Bugs

* Fix ws urls containing query parameters.

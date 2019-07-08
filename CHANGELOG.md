# Changelog

Note: koa-websocket follows semver.

## v6.0.0

* Upgrade ws to 7.0.1, which drops support for Node 6.
* Upgrade dev deps to fix a vuln with js-yaml.

## v5.0.1

* Remove accidental addition of npm from dependencies

## v5.0.0

* Upgraded all dependencies, including for ws to fix some security issues.

## v4.1.0

* Added support for passing https server options, enabling wss support - @stripedpajamas

## v4.0.0

* Switch Koa v2 support to master, and moved v1 to the legacy branch.
* Added ability to set websocket options.
* Upgraded to websocket 2.x.

## v3.0.1

Because NPM wouldn't let me retroactively tag 3.0.0 as `next` instead of latest.

## v3.0.0

This is a pre-release for compatibility with Koa 2. Doing `npm install koa-websocket` will continue to give you 2.x until Koa 2 is stable.

### Improvements

* Koa 2 comptiblity.

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

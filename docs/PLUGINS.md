# `grawlix`: Plugins

## Developing Plugins

> TODO

## Class: grawlix.GrawlixPlugin

### Constructor

```javascript
const GrawlixPlugin = require('grawlix').GrawlixPlugin;
var plugin = new GrawlixPlugin(options);
```

#### Arguments

##### options

Type: `Object`

Options object. Possible properties include:

- `name`: {String} The unique name of the plugin.
- `filters`: {Array} An optional array of filter objects. Works as described in the [Filters documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md).
- `styles`: {Array} An optional array of `GrawlixStyle` objects to add to the available styles. See the [GrawlixStyle class documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#class-grawlixgrawlixstyle) for more information on creating these.
- `init`: {Function} Overrides the plugin's `init` method ([see below]().) The function should accept one argument, an options `Object`. The `this` keyword will always be set to the `GrawlixPlugin` instance.

### Properties

##### name

Type: `String`

The unique name of this plugin. Should ideally be related to its package name.

##### filters

Type: `Array`

An array of filter objects to be added to the default filters. See the [Filters documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md) for how these are set up.

##### styles

Type: `Array`

An array of `GrawlixStyle` objects to be added to the default styles. See the [GrawlixStyle class documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#class-grawlixgrawlixstyle) for more information on creating these.

### Methods

#### init(options)

##### Arguments

- `options`: {Object} An options object. Same as that which is passed to the rest of the library. Can include plugin-specific configuration options.

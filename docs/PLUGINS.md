# `grawlix`: Plugins

__Contents__
- [Using Plugins](#using-plugins)
- [Developing Plugins](#developing-plugins)
  + [Class: grawlix.GrawlixPlugin](#class-grawlixgrawlixplugin)
    * [Constructor](#constructor)
    * [Properties](#properties)
    * [Methods](#methods)

***

## Using Plugins

A *plugin*, in this context, is a module that contains additional `grawlix` functionality, including additional word filters and/or styles. You can add plugins to `grawlix` by passing an array of objects via the `plugins` property when you configure your options:

```javascript
grawlix.setDefaults({
  plugins: [
    {
      plugin: require('plugin-module-name'),
      options: {
        // plugin-specific config options can go here
        // as needed
      }
    },
    // other plugins, etc.
  ]
});
```

Alternately, you can use the `grawlix.loadPlugin` method:

```javascript
grawlix.loadPlugin('plugin-module-name', {
  // plugin-specific config options go here
});
// you can also require/provide the plugin yourself
var plugin = require('plugin-module-name');
grawlix.loadPlugin(plugin, {
  // plugin options
});
```

Note that calls to `loadPlugin` can be chained:

```javascript
grawlix.loadPlugin('plugin-module-1')
       .loadPlugin('plugin-module-2')
       .loadPlugin('plugin-module-3');
```

## Developing Plugins

The key to developing your own plugin module is the `GrawlixPlugin` class ([see below](#class-grawlixgrawlixplugin)), accessible via the `grawlix.GrawlixPlugin` property. In order to be recognized, a plugin module must export one of the following:

* A `GrawlixPlugin` instance, or;
* A factory function that returns a `GrawlixPlugin` instance when called. Factory functions will be provided with two arguments:
  + `pluginOptions`: {Object} The plugin-specific options that were given to `grawlix` along with the module.
  + `options`: {Object} The main `grawlix` options object.

Here's a brief demonstration of both approaches:

```javascript
// exports a GrawlixPlugin object
const GrawlixPlugin = require('grawlix').GrawlixPlugin;
module.exports = new GrawlixPlugin({
  name: 'my-plugin-module',
  filters: [ /* filters */ ],
  styles: [ /* styles */ ],
  init: function(pluginOptions) {
    // you can override the plugin's init method to process options
    if (!pluginOptions.isFsckOkay) {
      this.filters.push({
        word: 'fsck',
        pattern: /fsck/i
      });
    }
  }
});

// exports a factory function
module.exports = function(options, pluginOptions) {
  var plugin = new GrawlixPlugin({
    name: 'my-plugin-module'
  });
  // with this approach, you can configure your plugin 
  // based on the general grawlix options...
  if (options.allowed.indexOf('fsck') === -1) {
    plugin.filters.push({
      word: 'fsck',
      pattern: /fsck/i
    });
  }
  // or use the plugin-specific options as you like
  if (!pluginOptions.isFsckOkay) {
    plugin.filters.push({
      // etc.
    });
  }
  // make sure to return a GrawlixPlugin object at the end!
  return plugin;
};
```

## Class: grawlix.GrawlixPlugin

### Constructor

```javascript
const GrawlixPlugin = require('grawlix').GrawlixPlugin;
var plugin = new GrawlixPlugin(options);
```

#### Arguments

##### options

Type: `Object`

Options object. Allows one to set all of the object's properties at once and/or override the class `init` method. Possible properties include:

- `name`: {String} The unique name of the plugin.
- `filters`: {Array} An array of [filter objects](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md#filter-objects) to add to grawlix's filters. Optional.
- `styles`: {Array} An array of [style objects](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#style-objects) to add to the available styles. Optional.
- `init`: {Function} Overrides the plugin's `init` method ([see below](#initoptions).) The function will be provided one argument, an `Object` with options specific to the plugin (if given.) The `this` keyword will always be set to the `GrawlixPlugin` instance.

### Properties

##### name

Type: `String`

The unique name of this plugin. Should ideally be related to its package name.

##### filters

Type: `Array`

An array of filter objects to be added to the default filters. See the [Filters documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md) for how these are set up.

##### styles

Type: `Array`

An array of style objects to be added to the default styles. See the [Style documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md) for more information.

### Methods

#### init(options)

##### Arguments

- `options`: {Object} An object containing plugin-specific options.

##### Returns

`void`

***

*Last updated April 17, 2017.*
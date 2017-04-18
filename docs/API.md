# `grawlix`: API

__Contents__
- [Function: grawlix](#function-grawlix)
  + [grawlix(str\[, options\])](#grawlixstr-options)
  + [grawlix.isObscene(str\[, filters, allowed\])](#grawlixisobscenestr-filters-allowed)
  + [grawlix.getDefaults()](#grawlixgetdefaults)
  + [grawlix.setDefaults(options)](#grawlixsetdefaultsoptions)
  + [grawlix.hasPlugin(plugin)](#grawlixhaspluginplugin)
  + [grawlix.loadPlugin(plugin\[, pluginOptions\])](#grawlixloadpluginplugin-options)
  + [grawlix.Style](#grawlixstyle)
  + [grawlix.GrawlixPlugin](#grawlixgrawlixplugin)
  + [grawlix.FilterTemplate](#grawlixfiltertemplate)

***

## Function: grawlix

### grawlix(str[, options])

Replaces all obscenities in the given string with grawlixes.

```javascript
var grawlix = require('grawlix');
var censored = grawlix(str); // uses default options
// or
var censored = grawlix(str, {
  style: 'ascii',
  randomize: true,
  filters: [],
  allowed: [],
  plugins: [],
  styles: []
});
```

#### str

Type: `String`

The content string to process. Required.

#### options

Type: `Object`

Optional. An object that may have any of the following properties:

- `style`: {String|Object} The style of grawlix to use when replacing obscenities. Defaults to `'ascii'`. To see the list of available default styles, see [README#Grawlix Styles](https://github.com/tinwatchman/grawlix#grawlix-styles). To see all available style options -- including how to create new styles -- see the [full Styles documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md).
- `randomize`: {Boolean} Defines whether or not grawlixes should be built via random selection or taken directly from [a map of fixed replacements](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#using-fixed-replacement-strings) (if supported by the style.) Defaults to `true`. Ignored when using a single-character style.
- `filters`: {Array} An optional array of filter objects. For a full description of how to use this property, see the [Filters documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md).
- `allowed`: {Array} An optional array of strings, representing a whitelist of words that shouldn't be replaced.
- `plugins`: {Array} An optional array of `grawlix` plugins to include. See the [Plugins documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/PLUGINS.md) for more details.
- `styles`: {Array} An optional array of grawlix style objects, used to add or configure styles aside from the main one specified by the `style` option. See the [full Styles documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md) for more information on style objects.

#### Returns

A `String` with all obscenities replaced by grawlixes.

### grawlix.isObscene(str[, filters, allowed])

Returns whether or not the given string contains known obscenities.

```javascript
var isTextObscene = grawlix.isObscene(text); // uses default options
// or
var isTextObscene = grawlix.isObscene(text, filters); // with array of filter 
                                                      // objects
// or
var isTextObscene = grawlix.isObscene(text, filters, allowed); // with array of 
                                                               // filter options 
                                                               // and whitelist
// or
var isTextObscene = grawlix.isObscene(text, null, allowed); // with just the 
                                                            // whitelist
```

#### str

Type: `String`

The content string to check. Required.

#### filters

Type: `Array`<br>
Default: `[]`

Optional. An array of filter objects. Identical to [the `filters` option described above](#options).

#### allowed

Type: `Array`<br>
Default: `[]`

Optional. An array of strings, representing a whitelist of words that shouldn't be replaced. Identical to [the `allowed` option described above](#options).

#### Returns

`Boolean` -- `true` if obscenity is found, `false` otherwise.

### grawlix.getDefaults()

Returns the current default options.

```javascript
var defaultOptions = grawlix.getDefaults();
```

#### Returns

`Object` which represents the current default options.

### grawlix.setDefaults(options)

Sets the default options.

```javascript
grawlix.setDefaults({
  style: 'ascii',
  randomize: true,
  filters: [],
  allowed: []
});
```

#### options

Type: `Object`

The default options to set. See (grawlix#Options)[#options] above.

### grawlix.hasPlugin(plugin)

Returns whether or not the given plugin has been added to the default options.

```javascript
// find by name
var isInstalled = grawlix.hasPlugin('my-plugin-module');
// find by direct reference
var plugin = require('my-plugin-module');
var isInstalled = grawlix.hasPlugin(plugin);
```

#### plugin

Type: `String`, `GrawlixPlugin`, or `Function`

Name of plugin, `GrawlixPlugin` object, or plugin factory function.

#### Returns

`Boolean` -- `true` if plugin found, `false` otherwise.

### grawlix.loadPlugin(plugin[, pluginOptions])

Adds the given plugin to the default options.

```javascript
// you can just provide the module name, like so...
grawlix.loadPlugin('plugin-module-name');
grawlix.loadPlugin('plugin-module-name', {
  // plugin-specific config options can go here
});
// or you can load and provide the plugin yourself
var plugin = require('plugin-module-name');
grawlix.loadPlugin(plugin);
grawlix.loadPlugin(plugin, {
  // plugin options
});
```

For convenience, this method can also be chained. Like so:

```javascript
grawlix.loadPlugin('plugin-module-1')
       .loadPlugin('plugin-module-2')
       .loadPlugin('plugin-module-3');
```

#### plugin

Type: `String`, `GrawlixPlugin`, or `Function`

The plugin to add to the default options. Required.

#### pluginOptions

Type: `Object`<br>
Default: `{}`

Optional. A map of config options specifically for this plugin. See the plugin's own documentation to see what options are available (if any.)

#### Returns

The main `grawlix` function, so as to enable chaining.

### grawlix.Style

See [Enumeration: grawlix.Style](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#enumeration-grawlixstyle).

### grawlix.GrawlixPlugin

See [Class: grawlix.GrawlixPlugin](https://github.com/tinwatchman/grawlix/blob/master/docs/PLUGINS.md#class-grawlixgrawlixplugin).

### grawlix.FilterTemplate

See [Enumeration: grawlix.FilterTemplate](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md#enumeration-grawlixfiltertemplate).

***

*Last updated April 17, 2017.*
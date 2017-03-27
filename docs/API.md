# `grawlix`: API

__Contents__
- [Function: grawlix](#function-grawlix)
  + [grawlix(str\[, options\])](#grawlixstr-options)
  + [grawlix.isObscene(str\[, filters, allowed\])](#grawlixisobscenestr-filters-allowed)
  + [grawlix.getDefaults()](#grawlixgetdefaults)
  + [grawlix.setDefaults(options)](#grawlixsetdefaultsoptions)
  + [grawlix.Style](#grawlixstyle)
  + [grawlix.GrawlixStyle](#grawlixgrawlixstyle)
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
  allowed: []
});
```

#### str

Type: `String`

The content string to process. **Required.**

#### options

Type: `Object`

Optional. An object that may have any of the following properties:

- `style`: {String|Object} The style of grawlix to use when replacing obscenities. Defaults to `'ascii'`. To see the list of available default styles, see [README#Grawlix Styles](https://github.com/tinwatchman/grawlix#grawlix-styles). To see all available style options -- including how to create new styles -- see the [full Styles documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md).
- `randomize`: {Boolean} Defines whether or not grawlixes should be built via random selection or taken directly from [a map of fixed replacements](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#using-fixed-replacement-strings) (if supported by the style.) Defaults to `true`. Ignored when using a single-character style.
- `filters`: {Array} An optional array of filter objects. For a full description of how to use this property, see the [Filters documentation](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md).
- `allowed`: {Array} An optional array of strings, representing a whitelist of words that shouldn't be replaced.

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

The content string to check. **Required.**

#### filters

Type: `Array`<br>
Default: `[]`

Optional. An array of filter objects. Identical to [the `filter` option above](#options).

#### allowed

Type: `Array`<br>
Default: `[]`

Optional. An array of strings, representing a whitelist of words that shouldn't be replaced. Identical to [the `allowed` option above](#options).

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

### grawlix.Style

See [Enumeration: grawlix.Style](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#enumeration-grawlixstyle).

### grawlix.GrawlixStyle

See [Class: grawlix.GrawlixStyle](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md#class-grawlixgrawlixstyle).

### grawlix.FilterTemplate

See [Enumeration: grawlix.FilterTemplate](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md#enumeration-grawlixfiltertemplate).

***

*Last updated March 27, 2017.*
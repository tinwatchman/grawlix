# `grawlix`: Filters

__Contents__
- [Filter Objects](#filter-objects)
  + Properties:
    * [word](#word)
    * [pattern](#pattern)
    * [priority](#priority)
    * [minPriority](#minpriority)
    * [expandable](#expandable)
    * [template](#template)
    * [style](#style)
- [Adding New Filters](#adding-new-filters)
- [Configuring Filters](#configuring-filters)
- [Filter Templates](#filter-templates)
  + [Enumeration: grawlix.FilterTemplate](#enumeration-grawlixfiltertemplate)

***

## Filter Objects

Filter objects can be used to either create new `grawlix` filters or configure existing ones. They can have the following properties:

### word

Type: `String`

Lowercase 'canonical' version of the word the filter is targeting. This property is **required.**

### pattern

Type: `RegExp`

Regular expression targeting the given word. This property is **required** for new filters.

### priority

Type: `Number`<br>
Default: `0`

Optional. This property determines the order in which filters are run on a given string. The lower the value, the sooner the filter is run. (Setting this number to a negative value, for instance, will make the filter run before all the default filters.) This can be used to set up cascading 'families' of filters for detecting specific scenarios that a single regular expression can't cover. To see how the default filters go about doing this, see [filters.js](https://github.com/tinwatchman/grawlix/blob/master/filters.js#L226).

### minPriority

Type: `Number`

Optional. This property will set the filter's priority to the given value if and only if the current priority is less than the given value. This may be useful as a way of avoiding overriding other settings when configuring filters from within plugins.

### expandable

Type: `Boolean`<br>
Default: `false`

Optional. This flag should be set to `true` in filters where the regular expression might match more or less characters than a word's 'canonical' length. Imagine, for instance, a situation where we don't merely want to target the string `badword`, but all variant spellings or attempts to obfuscate the word, e.g. `baaaadword`, `badwordd`, `b a d w o r d`, etc. Setting this flag informs the library that it needs to check the length of the matched word when preparing a replacement grawlix for this filter. If this isn't necessary, however, the property should be left `false`.

### template

Type: `String`<br>
Default: `null`

Optional. For more information on this property and how to use it, see [Filter Templates](#filter-templates) below.

### style

Type: `String`<br>
Default: `null`

(**New in v1.0.5**) Sets a specific style for a filter, overriding whatever the main style is when replacing the filter's word. This allows one to replace specific words with entirely different styles of grawlixes. For example:

```javascript
var grawlix = require('grawlix');
grawlix.setDefaults({
  style: 'asterix',
  filters: [
    {
      word: 'foo',
      pattern: /foo/i
    },
    {
      word: 'bar',
      pattern: /bar/i,
      style: 'redacted'
    }
  ]
});
grawlix('I hate that fooing bar.');
// returns: 'I hate that ***ing ███.'
```

## Adding New Filters

```javascript
grawlix.setDefaults({
  filters: [
    {
      word: 'fsck',
      pattern: /fsck/i,
      priority: 0,
      expandable: false,
      template: null
    }
  ]
});
```

Note that filters can also be passed in via the options object when calling the `grawlix` function, like so:

```javascript
var censored = grawlix(text, {
  filters: [
    {
      word: 'fsck',
      pattern: /fsck/i
      // ... other properties, etc.
    }
  ]
});
```

However, setting filters via `setDefaults` will likely deliver better performance. 

## Configuring Filters

The `filters` option can also be used to reconfigure the existing default filters if necessary. To do this, one merely has to leave out the `pattern` property. The library will then interpret the object as configuration settings for an existing filter.

For example -- the following code will update the priority property of the default `bastard` filter:

```javascript
grawlix.setDefaults({
  filters: [
    {
      word: 'bastard',
      priority: 1 
    }
  ]
});
```

Messing with the internals of the library in this manner will most likely be unnecessary for most developers. Still, the option is there.

## Filter Templates

On occasion, it may prove impossible to extract a target word without the regular expression picking up one or more characters two from the surrounding text. Filter templates exist to prevent this extra baggage from being replaced by the grawlix. It works like this:

- Within your regular expression, surround the part that's capturing extra characters with [parentheses](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_parentheses).
- Choose or provide a string to act as the filter's template.

Filter template strings are standard [Underscore.js templates](http://underscorejs.org/#template) that accept only one parameter -- a String called `word`. For examples of template strings, see the `FilterTemplate` enumeration in [filters.js](https://github.com/tinwatchman/grawlix/blob/master/filters.js#L6). These strings are available to code outside of the package via the `grawlix.FilterTemplate` property. Like so:

```javascript
grawlix.setDefaults({
  filters: [
    {
      word: 'fsck',
      pattern: /(\s)fsck/i, // no, there isn't any good reason to grab whitespace here. 
                            // chill. it's just an example.
      template: grawlix.FilterTemplate.PRE
    }
  ]
});
```

### Enumeration: grawlix.FilterTemplate

Properties:

+ `PRE`: template string where first substring match goes before/in front of the word being replaced. Raw string value: `'$1<%= word %>'`.
+ `POST`: template string where first substring match goes before/after the word being replaced. Raw string value: `'<%= word %>$1'`.
+ `BETWEEN`: template string where word goes between the first and second substring matches. Raw string value: `'$1<%= word %>$2'`.

***

*Last updated April 18, 2017.*
grawlix
=======
> Make the Internet swear like a cartoon

`grawlix` is a configurable `RegExp`-based profanity filter that swaps out obscene words for [grawlixes](https://en.wiktionary.org/wiki/grawlix) -- long strings of emoticons or typographical symbols often used to represent swearing in comic strips and cartoons. Primarily aimed at George Carlin's ["Seven Dirty Words"](https://en.wikipedia.org/wiki/Seven_dirty_words), the library's default filters have been [rigorously tested](https://github.com/tinwatchman/grawlix/blob/master/spec/filter-spec.js#L266) against potential false positives and [Scunthorpe problems](https://en.wikipedia.org/wiki/Scunthorpe_problem). It's also highly extensible, allowing new words and grawlix styles to be easily added as needed.

Please note that, due to the subject matter, the `grawlix` source code may be considered **NSFW/Not Safe For Work**, depending on an individual reader's circumstances. To see the full list of the words the library currently targets, see [this file](https://github.com/tinwatchman/grawlix/blob/master/WORDS.json).

## Installation

```sh
npm install grawlix --save
```

## Usage

```javascript
var grawlix = require('grawlix');
var censored = grawlix(text, { /* options go here */ }); // outputs '%!@*'
```

Alternatively, if you prefer not having to pass in options with every call, you can also configure the library's default settings with the `setDefaults` method:

```javascript
grawlix.setDefaults({
  // set default options here
});
// options will apply to every call made after this point
var censored = grawlix(text); // outputs '@$^!#@%@!#'
```

### Options

```javascript
grawlix.setDefaults({
  style: 'ascii',
  randomize: true,
  filters: [],
  allowed: []
});
```

##### style

Type: `String` or `Object`<br>
Default: `'ascii'`

What style of grawlix the function should use when replacing curse words. To see the list of available styles, see the [Styles](#styles) section below.

##### randomize

Type: `Boolean`<br>
Default: `true`

Sets whether or not grawlixes should be built by randomly selecting from a list of characters, or taken directly from a map of fixed replacements. Ignored when using a single-character style.

##### filters

Type: `Array`<br>
Default: `[]`

An `Array` of objects, representing either new words that should be replaced or configuration options for existing filters. For more information on how to use this property, see [Adding New Filters](#adding_new_filters) below.

##### allowed

Type: `Array`<br>
Default: `[]`

An `Array` of strings, representing a whitelist of words that shouldn't be replaced. Passing in a word or list of words that's [targeted by default](https://github.com/tinwatchman/grawlix/blob/master/WORDS.json) will deactivate their associated filters.

<a name="styles"></a>
## Grawlix Styles

Seven different styles of grawlixes are available within the library by default. The three primary styles are:

+ `'ascii'`: the default style. Generates grawlixes from the following standard typographical symbols: `@!#$%^&*`.
+ `'dingbats'`: Generates grawlixes from this list of Unicode-only symbols: `★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡♯✓☝`.
+ `'unicode'`: Generates grawlixes from this combined list of standard typographical and Unicode-only symbols: `!@#$%★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡`.

In addition, the following 'single-character' styles are also available:

+ `'asterix'`: Replaces targeted words with asterixes, e.g. `*`.
+ `'nextwave'`: Replaces targeted words with `☠` symbols. Requires Unicode support.
+ `'redacted'`: Replaces targeted words with `█` symbols. Requires Unicode support.
+ `'underscore'`: Replaces targeted words with underscores, e.g. `_`.

To use one of these styles, simply pass in the desired style's name in the `options` object:

```javascript
var censored = grawlix(text, {
  style: 'nextwave'
});
// outputs '☠☠☠☠☠☠'
```

For information on advanced options, including on how to create grawlix styles, see the [Styles](https://github.com/tinwatchman/grawlix/blob/master/docs/STYLES.md) documentation.

<a name="adding_new_filters"></a>
## Adding New Filters

To ease the process of adapting to new demands (such as targeting obscene words not supported by default, or supporting languages other than English), `grawlix` accepts new filters via the `options` object. Let's say, for example, that you decide you want to prevent your forum users from discussing Unix's [File System Consistency Check](https://en.wikipedia.org/wiki/Fsck) tool. You can add a filter targeting the word to the library's default settings like so:

```javascript
grawlix.setDefaults({
  filters: [
    {
      word: 'fsck',
      pattern: /fsck/i // this property *must* be a RegExp object
    }
  ]
});
```

For more information on creating and configuring filters, see the [Filters](https://github.com/tinwatchman/grawlix/blob/master/docs/FILTERS.md) documentation.

## Testing

```sh
npm test
```

## Credits and Licensing

Created by [Jon Stout](http://www.jonstout.net). Licensed under [the MIT license](http://opensource.org/licenses/MIT).
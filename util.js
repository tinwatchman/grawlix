'use strict';

const _ = require('underscore');

const defaultFilters = require('./filters').filters;
const defaultStyles = require('./styles').styles;
const FilterSort = require('./filters').FilterSort;
const toGrawlixFilter = require('./filters').toGrawlixFilter;
const GrawlixStyle = require('./styles').GrawlixStyle;

/**
 * Parse grawlix options
 * @param  {Object}          options  Options object. See grawlix.js#grawlix for 
 *                                    details.
 * @param  {Object}          defaults Default options. Optional.
 * @return {GrawlixSettings}
 */
exports.parseOptions = function(options, defaults) {
  if (!_.isUndefined(defaults)) {
    _.defaults(options, defaults);
  }
  var settings = new GrawlixSettings();
  settings.isRandom = options.randomize;
  // load default filters
  settings.filters = _.filter(defaultFilters, function(filter) {
    // check to see if word is on whitelist
    var isAllowed = _.contains(options.allowed, filter.word);
    // check to see if options has a replacement filter
    var isReplaced = _.some(options.filters, function(optFilter) {
      return (
        _.has(optFilter, 'word') && 
        optFilter.word === filter.word &&
        _.has(optFilter, 'pattern')
      );
    });
    return (!isAllowed && !isReplaced);
  });
  // add option filters (if any) and/or configure filter options
  if (options.filters.length > 0) {
    _.each(options.filters, function(obj) {
      if (!_.has(obj, 'word')) {
        return;
      }
      var filter;
      if (!_.has(obj, 'pattern')) {
        // configure existing filter options
        filter = _.findWhere(settings.filters, { word: obj.word });
        if (!_.isUndefined(filter)) {
          filter.configure(obj);
        }
      } else if (!_.contains(options.allowed, obj.word)) {
        // if filter word isn't whitelisted, add new filter
        filter = toGrawlixFilter(obj);
        if (filter.isValid()) {
          settings.filters.push(filter);
        }
      }
    });
  }
  // sort filters
  settings.filters.sort(FilterSort);
  // get style
  settings.style = getStyleOptions(options);
  // return settings
  return settings;
};

/**
 * GrawlixSettings class
 * Class for settings object returned by parseOptions
 */
var GrawlixSettings = function() {
  this.isRandom = true;
  this.filters = null;
  this.style = null;
};
GrawlixSettings.prototype = {};

/**
 * Parses grawlix style options
 * @param  {Object}       options Options object
 * @return {GrawlixStyle}         GrawlixStyle object
 */
var getStyleOptions = function(options) {
  if (_.has(options, 'style') && options.style instanceof GrawlixStyle) {
    return options.style;
  }
  var style;
  var isOptObject = false;
  if (!_.isString(options.style) && _.has(options.style, 'name')) {
    style = _.findWhere(defaultStyles, { name: options.style.name });
    isOptObject = true;
  } else {
    style = _.findWhere(defaultStyles, { name: options.style });
  }
  if (_.isUndefined(style)) {
    throw new Error('grawlix style not found!');
  }
  // check for style character options
  var hasCharOptions = (isOptObject && _.has(options.style, 'chars'));
  var isCharOptionObj = (hasCharOptions && !_.isString(options.style.chars));
  if (hasCharOptions && !isCharOptionObj) {
    style.chars = options.style.chars;
  }
  if (isCharOptionObj && _.has(options.style.chars, 'add')) {
    addStyleOptionChars(style, options.style.chars.add);
  }
  if (isCharOptionObj && _.has(options.style.chars, 'remove')) {
    removeStyleOptionChars(style, options.style.chars.remove);
  }
  // check for fixed replacements
  if (options.randomize && isOptObject && _.has(options.style, 'replacements')){
    style.replaces = _.extend({}, style.replaces, options.replacements);
  }
  // return style
  return style;
};
exports.getStyleOptions = getStyleOptions;

/**
 * Add given characters to style character string
 * @param {GrawlixStyle} style     GrawlixStyle object
 * @param {String}       additions Chars to add (will also accept Array)
 */
var addStyleOptionChars = function(style, additions) {
  var addChars = _.isArray(additions) ? additions : additions.split('');
  _.each(addChars, function(newChar) {
    if (style.chars.indexOf(newChar) === -1) {
      style.chars += newChar;
    }
  });
  return style;
};
exports.addStyleOptionChars = addStyleOptionChars;

/**
 * Removes given characters from style character string
 * @param  {GrawlixStyle} style   Style object
 * @param  {String}       removes Chars to remove (will also accept Array)
 */
var removeStyleOptionChars = function(style, removes) {
  var chars = style.chars.split('');
  var accepted = _.filter(chars, function(char) {
    return (removes.indexOf(char) === -1);
  });
  style.chars = accepted.join('');
  return style;
}
exports.removeStyleOptionChars = removeStyleOptionChars;

/**
 * Replaces a filter match in a string
 * @param  {String}          str      Content string
 * @param  {GrawlixFilter}   filter   GrawlixFilter object
 * @param  {GrawlixSettings} settings GrawlixSettings object
 * @return {String}                   String with replacement applied
 */
exports.replaceMatch = function(str, filter, settings) {
  // unpack settings for convenience / readability
  var style = settings.style;
  // get replacement grawlix
  var repl;
  if (!settings.isRandom && style.hasFixed(filter.word)) {
    // if in fixed replacement mode and style has a defined fixed replacement 
    // string for the filter's word 
    repl = style.getFixed(filter.word);
  } else if (style.canRandomize()) {
    // if style supports generating a random grawlix
    repl = generateGrawlix(str, filter, style, getRandomGrawlix);
  } else {
    // if single-character style
    repl = generateGrawlix(str, filter, style, getFillGrawlix);
  }
  // replace the match
  return str.replace(filter.regex, repl);
};

/**
 * Replaces matched content with a grawlix, taking into account filter and style
 * settings.
 * @param  {String}        str       Content string
 * @param  {GrawlixFilter} filter    Filter object
 * @param  {GrawlixStyle}  style     Style object
 * @param  {Function}      generator Function to use to generate grawlix
 * @return {String}                  Grawlix replacement string
 */
var generateGrawlix = function(str, filter, style, generator) {
  // determine length
  var len;
  if (filter.isExpandable) {
    len = filter.getMatchLen(str);
  } else {
    len = filter.word.length;
  }
  // generate grawlix
  var grawlix = generator(style.chars, len);
  // apply filter template if necessary
  if (filter.hasTemplate()) {
    return filter.template(grawlix);
  }
  return grawlix;
};

/**
 * Creates a string of the given length that's just the same character repeated 
 * over and over.
 * @param  {String} char Character
 * @param  {Number} len  Desired length of string
 * @return {String}
 */
var getFillGrawlix = function(char, len) {
  if (char.length > 0) {
    char = char.charAt(0);
  }
  var grawlixChars = [];
  for (var i=0; i<len; i++) {
    grawlixChars.push(char);
  }
  return grawlixChars.join('');
};
exports.getFillGrawlix = getFillGrawlix;

/**
 * Assembles a random grawlix of the given length
 * @param  {String} chars String of characters to use
 * @param  {Number} len   Length of grawlix to return
 * @return {String}       Grawlix of given length
 */
var getRandomGrawlix = function(chars, len) {
  var result = [];
  var char;
  var prev;
  while (result.length < len) {
    char = chars.charAt(_.random(chars.length-1));
    // make sure not to repeat characters
    if (char === prev) {
      continue;
    // make sure never to end on a !
    } else if (char === '!' && result.length === (len-1)) {
      continue;
    }
    // add to result, remember as prev character
    result.push(char);
    prev = char;
  }
  return result.join('');
};
exports.getRandomGrawlix = getRandomGrawlix;

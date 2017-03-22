'use strict';

const _ = require('underscore');

const defaultFilters = require('./filters').filters;
const defaultStyles = require('./styles').styles;
const FilterSort = require('./filters').FilterSort;
const toGrawlixFilter = require('./filters').toGrawlixFilter;
const GrawlixStyle = require('./styles').GrawlixStyle;

/**
 * Creates a string of the given length that's just the same character repeated 
 * over and over.
 * @param  {String} char Character
 * @param  {Number} len  Desired length of string
 * @return {String}
 */
exports.getFill = function(char, len) {
  if (char.length > 0) {
    char = char.charAt(0);
  }
  var chars = [];
  for (var i=0; i<len; i++) {
    chars.push(char);
  }
  return chars.join('');
};

/**
 * Assembles a random grawlix of the given length
 * @param  {String} chars String of characters to use
 * @param  {Number} len   Length of grawlix to return
 * @return {String}       Grawlix of given length
 */
exports.getRandom = function(chars, len) {
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

/**
 * Class for Settings object that's returned by parseOptions
 */
var GrawlixSettings = function() {
  this.isRandom = true;
  this.filters = null;
  this.style = null;
};
GrawlixSettings.prototype = {};

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
    var optFilter = _.findWhere(options.filters, { word: filter.word });
    return (!isAllowed && _.isUndefined(optFilter));
  });
  // add option filters (if any)
  if (options.filters.length > 0) {
    _.each(options.filters, function(filterObj) {
      var filter = toGrawlixFilter(filterObj);
      var isAllowed = _.contains(options.allowed, filter.word);
      if (!isAllowed) {
        settings.filters.push(filter);
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

var getStyleOptions = function(options) {
  if (options.style instanceof GrawlixStyle) {
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

var removeStyleOptionChars = function(style, removes) {
  var chars = style.chars.split('');
  var accepted = _.filter(chars, function(char) {
    return (removes.indexOf(char) === -1);
  });
  style.chars = accepted.join('');
  return style;
}
exports.removeStyleOptionChars = removeStyleOptionChars;

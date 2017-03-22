'use strict';

const _ = require('underscore');
const util = require('./util');
const Style = require('./styles').Style;

var defaultOptions = {
  style: Style.ASCII,
  randomize: true,
  allowed: [],
  filters: []
};
var cachedOpts = null;

/**
 * Main grawlix function
 * @param  {String}  str               Content string to process
 * @param  {Object}  options           Options object. Optional.
 * @param  {Object}  options.style     Style of grawlix to use for replacements. 
 *                                     Can be either a string, with the name of 
 *                                     the style to use; or an object with a 
 *                                     required `name` property. See readme for 
 *                                     more details / available options.
 * @param  {Boolean} options.randomize Whether or not to replace curses with 
 *                                     randomized or fixed grawlixes. Default is 
 *                                     true.
 * @param  {Array}   options.allowed   Array of strings, representing 
 *                                     whitelisted words that would otherwise be 
 *                                     replaced. Optional.
 * @param  {Array}   options.filters   Array of custom filter objects. Each 
 *                                     object must have at least two properties: 
 *                                     `word` (the word being replaced) and 
 *                                     `regex` (regex to find the word). See 
 *                                     readme for more details. Optional.
 * @return {String}                    Processed string
 */
var grawlix = function(str, options) {
  // get settings
  var opts;
  if (_.isUndefined(options) && cachedOpts !== null) {
    opts = cachedOpts;
  } else if (!_.isUndefined(options)) {
    opts = util.parseOptions(options, defaultOptions);
  } else {
    opts = util.parseOptions(defaultOptions);
  }
  cachedOpts = opts;
  // apply filters
  _.each(opts.filters, function(filter) {
    while (filter.isMatch(str)) {
      var repl;
      if (!opts.isRandom && opts.style.hasFixed(filter.word)) {
        repl = opts.style.replaces[filter.word];
      } else if (opts.isRandom && style.canRandomize() && filter.hasPlacement()){
        repl = filter.getReplaceTemplate(util.getRandom(filter.word.length));
      } else if (opts.isRandom && style.canRandomize()) {
        repl = util.getRandom(filter.word.length);
      } else if (filter.hasPlacement()) {
        repl = filter.getReplaceTemplate(
          util.getFill(opts.style.chars, filter.word.length)
        );
      } else {
        repl = util.getFill(opts.style.chars, filter.word.length);
      }
      str = str.replace(filter.regex, repl);
    }
  });
  // return
  return str;
};
grawlix.Style = Style;
grawlix.GrawlixStyle = require('./styles').GrawlixStyle;

/**
 * Get default options
 * @return {Object} Default options object
 */
grawlix.getDefaults = function() {
  return defaultOptions;
};

/**
 * Set default options
 * @param {Object} options Defaults to set
 */
grawlix.setDefaults = function(options) {
  defaultOptions = _.extend({}, defaultOptions, options);
  cachedOpts = null;
};

/**
 * Export
 * @type {Function}
 */
module.exports = grawlix;

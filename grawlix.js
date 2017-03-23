'use strict';

const _ = require('underscore');
const util = require('./util');
const Style = require('./styles').Style;

/**
 * Grawlix default options
 * @type {Object}
 */
var defaultOptions = {
  style: Style.ASCII,
  randomize: true,
  allowed: [],
  filters: []
};

/**
 * Cached settings object; no need to repeat that work if the options haven't 
 * changed.
 * @type {GrawlixSettings}
 */
var defaultSettings = null;

/**
 * Replaces all curse words in the given content string with cartoon-like 
 * grawlixes.
 * @param  {String}  str               Content string
 * @param  {Object}  options           Options object. Optional.
 * @param  {Object}  options.style     Style of grawlix to use for replacements. 
 *                                     Can be either a string, with the name of 
 *                                     the style to use; or an object with a 
 *                                     required `name` property. See readme for 
 *                                     more details and available options. 
 *                                     Defaults to the `ascii` style.
 * @param  {Boolean} options.randomize Whether or not to replace curses with 
 *                                     randomized or fixed grawlixes. Default is 
 *                                     true.
 * @param  {Array}   options.allowed   Array of strings, representing 
 *                                     whitelisted words that would otherwise be 
 *                                     replaced. Optional.
 * @param  {Array}   options.filters   Array of custom filter objects. These can
 *                                     either reconfigure one of the existing 
 *                                     default filter, or represent an entirely
 *                                     new filter. See readme for details. 
 *                                     Optional.
 * @return {String}                    Processed string
 */
var grawlix = function(str, options) {
  // get settings
  var settings;
  if (_.isUndefined(options) && defaultSettings !== null) {
    settings = defaultSettings;
  } else if (!_.isUndefined(options)) {
    settings = util.parseOptions(options, defaultOptions);
  } else {
    settings = util.parseOptions(defaultOptions);
    defaultSettings = settings;
  }
  // apply filters
  _.each(settings.filters, function(filter) {
    while (filter.isMatch(str)) {
      str = util.replaceMatch(str, filter, settings);
    }
  });
  // return
  return str;
};

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
  defaultSettings = null;
};

/**
 * Enum and class exports
 */
grawlix.Style = Style;
grawlix.GrawlixStyle = require('./styles').GrawlixStyle;
grawlix.FilterTemplate = require('./filters').FilterTemplate;

/**
 * Export
 * @type {Function}
 */
module.exports = grawlix;

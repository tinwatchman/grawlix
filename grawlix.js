'use strict';

const _ = require('underscore');
const util = require('./util');
const Style = require('./styles').Style;
const GrawlixPlugin = require('./plugin').GrawlixPlugin;
const GrawlixPluginError = require('./plugin').GrawlixPluginError;

/**
 * Grawlix default options
 * @type {Object}
 */
var defaultOptions = {
  style: Style.ASCII,
  randomize: true,
  plugins: [],
  filters: [],
  styles: [],
  allowed: []
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
 * @param  {Array}   options.plugins   Array of either plugin factory functions 
 *                                     or GrawlixPlugin objects. See docs for 
 *                                     details. Optional.
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
  // return processed string
  return util.replaceMatches(str, settings);
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
 * Returns whether or not the given string contains any profanity matches
 * @param  {String}  str     Content string
 * @param  {Array}   filters Array of filter objects. Optional.
 * @param  {Array}   allowed Array of words to allow. Optional.
 * @return {Boolean}         True if a filter matches, false otherwise.
 */
grawlix.isObscene = function(str, filters, allowed) {
  // get settings
  var settings;
  if (_.isUndefined(filters) && _.isUndefined(allowed) && 
      defaultSettings !== null) {
    settings = defaultSettings;
  } else if (_.isArray(filters) || _.isArray(allowed)) {
    settings = util.parseOptions({
      filters: (!_.isUndefined(filters) && filters !== null) ? filters : [],
      allowed: (!_.isUndefined(allowed) && allowed !== null) ? allowed : []
    }, defaultOptions);
  } else {
    settings = util.parseOptions(defaultOptions);
    defaultSettings = settings;
  }
  // return if there's a filter match
  return util.isMatch(str, settings);
};

/**
 * Adds a plugin to the default options.
 * @param  {*}       plugin         Either a GrawlixPlugin instance, a factory 
 *                                  function that returns a GrawlixPlugin 
 *                                  instance, or a module name to load via 
 *                                  require.
 * @param  {Object}  pluginOptions  Plugin-specific options. Optional.
 * @return {grawlix}                Return self for chaining
 */
grawlix.loadPlugin = function(plugin, pluginOptions) {
  var obj = {};
  if (plugin instanceof GrawlixPlugin || _.isFunction(plugin)) {
    obj.plugin = plugin;
  } else if (_.isString(plugin)) {
    // presume it's a module name to load
    obj.module = plugin;
  } else {
    throw new GrawlixPluginError({
      message: 'invalid plugin',
      plugin: plugin,
      trace: new Error()
    });
  }
  obj.options = !_.isUndefined(pluginOptions) ? pluginOptions : {};
  defaultOptions.plugins.push(obj);
  // return self for chaining
  return grawlix;
};

/**
 * Returns whether or not given plugin has been added to the default options.
 * @param  {*}       plugin Plugin name, module id, GrawlixPlugin instance, or 
 *                          factory function.
 * @return {Boolean}
 */
grawlix.hasPlugin = function(plugin) {
  return util.hasPlugin(plugin, defaultOptions);
};

/**
 * Enum and class exports
 */
grawlix.Style = Style;
grawlix.GrawlixPlugin = GrawlixPlugin;
grawlix.FilterTemplate = require('./filters').FilterTemplate;
grawlix.error = {
  GrawlixFilterError: require('./filters').GrawlixFilterError,
  GrawlixPluginError: GrawlixPluginError,
  GrawlixStyleError: require('./styles').GrawlixStyleError
};

/**
 * Export
 * @type {Function}
 */
module.exports = grawlix;

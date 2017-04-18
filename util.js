'use strict';

const _ = require('underscore');

const defaultFilters = require('./filters').filters;
const defaultStyles = require('./styles').styles;
const FilterSort = require('./filters').FilterSort;
const GrawlixFilter = require('./filters').GrawlixFilter;
const toGrawlixFilter = require('./filters').toGrawlixFilter;
const GrawlixFilterError = require('./filters').GrawlixFilterError;
const GrawlixStyle = require('./styles').GrawlixStyle;
const toGrawlixStyle = require('./styles').toGrawlixStyle;
const GrawlixStyleError = require('./styles').GrawlixStyleError;
const GrawlixPlugin = require('./plugin').GrawlixPlugin;
const GrawlixPluginError = require('./plugin').GrawlixPluginError;

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
  // get settings
  var settings = new GrawlixSettings();
  settings.isRandom = options.randomize;
  // load default filters
  _.each(defaultFilters, function(filter) {
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
    if (!isAllowed && !isReplaced && filter.isValid()) {
      settings.filters.push( filter.clone() );
    }
  });
  // load default styles
  _.each(defaultStyles, function(style) {
    if (style instanceof GrawlixStyle && style.isValid()) {
      settings.styles.push( style.clone() );
    }
  });
  // load plugins (if we have any)
  if (options.plugins.length > 0) {
    _.each(options.plugins, function(pluginInfo) {
      loadPlugin(settings, pluginInfo, options);
    });
  }
  // add option filters (if any) and/or configure filter options
  loadFilters(settings, options.filters, options.allowed);
  // sort filters
  settings.filters.sort(FilterSort);
  // add option styles / configure style options
  loadStyles(settings, options.styles);
  // get main style
  if (!_.has(options, 'style') || options.style === null) {
    throw new Error('grawlix main style not defined!');
  }
  var style;
  // see if is style configuration
  if (_.isString(options.style)) {
    style = _.findWhere(settings.styles, { name: options.style });
  } else if (_.isObject(options.style) && _.has(options.style, 'name')) {
    style = _.findWhere(settings.styles, { name: options.style.name });
  }
  if (!_.isUndefined(style) && !_.isString(style)) {
    style.configure(options.style);
  } else if (_.isUndefined(style)) {
    style = toGrawlixStyle(options.style);
  }
  settings.style = style;
  // return settings
  return settings;
};

/**
 * GrawlixSettings class
 * Class for settings object returned by parseOptions
 */
var GrawlixSettings = function() {
  this.isRandom = true;
  this.filters = [];
  this.style = null;
  this.styles = [];
  this.loadedPlugins = [];
};
GrawlixSettings.prototype = {};
exports.GrawlixSettings = GrawlixSettings;

/**
 * Loads the given plugin into the given GrawlixSettings object
 * @param  {GrawlixSettings} settings   GrawlixSettings object
 * @param  {Object|Function} pluginInfo Either a factory function, a 
 *                                      GrawlixPlugin object, or an object 
 *                                      wrapping a factory function or 
 *                                      GrawlixPlugin with additional 
 *                                      plugin-specific config options
 * @param  {Object}          options    Main grawlix options object
 * @return {GrawlixSettings}            Settings object with plugin loaded
 */
var loadPlugin = function(settings, pluginInfo, options) {
  // unpack plugin and plugin options
  var pluginOrFunc;
  var pluginOpts;
  var plugin;
  if (_.isFunction(pluginInfo) || pluginInfo instanceof GrawlixPlugin) {
    // if we're just given the straight plugin without any options
    pluginOrFunc = pluginInfo;
    pluginOpts = {};
  } else if (_.has(pluginInfo, 'plugin')) {
    // if we're given an object with a `plugin` property (and maybe options)
    pluginOrFunc = pluginInfo.plugin;
    pluginOpts = _.has(pluginInfo, 'options') ? pluginInfo.options : {};
  }
  // instantiate plugin if necessary
  if (_.isFunction(pluginOrFunc)) {
    plugin = pluginOrFunc(pluginOpts, options);
  } else if (pluginOrFunc instanceof GrawlixPlugin) {
    plugin = pluginOrFunc;
  }
  if (_.isUndefined(plugin)) {
    throw new GrawlixPluginError({
      msg: 'plugin is undefined',
      plugin: pluginInfo
    });
  } else if (!(plugin instanceof GrawlixPlugin)) {
    throw new GrawlixPluginError({
      msg: 'object is not a GrawlixPlugin',
      plugin: pluginInfo
    });
  } else if (plugin.name === null || _.isEmpty(plugin.name)) {
    throw new GrawlixPluginError({
      msg: 'invalid plugin; name property is not provided',
      plugin: pluginInfo
    });
  }
  // initialize plugin
  plugin.init(pluginOpts);
  // load filters
  if (!_.isUndefined(plugin.filters) && _.isArray(plugin.filters)) {
    try {
      loadFilters(settings, plugin.filters, options.allowed);
    } catch (err) {
      throw new GrawlixPluginError({
        msg: 'error loading plugin filters',
        plugin: plugin,
        baseError: err
      });
    }
  }
  // load styles
  if (!_.isUndefined(plugin.styles) && _.isArray(plugin.styles)) {
    try {
      loadStyles(settings, plugin.styles);
    } catch (err) {
      throw new GrawlixPluginError({
        msg: 'error loading plugin styles',
        plugin: plugin,
        baseError: err
      });
    }
  }
  // add name to loaded plugins
  settings.loadedPlugins.push(plugin.name);
  // return
  return settings;
};
exports.loadPlugin = loadPlugin;

/**
 * Loads an array of filter objects into the GrawlixSettings object
 * @param  {GrawlixSettings} settings GrawlixSettings object
 * @param  {Array}           filters  Array of filter objects
 * @param  {Array}           allowed  Whitelist of words to ignore
 * @return {GrawlixSettings}          Settings objects with filters added
 */
var loadFilters = function(settings, filters, allowed) {
  if (filters.length > 0) {
    _.each(filters, function(obj) {
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
      } else if (!_.contains(allowed, obj.word)) {
        // if filter word isn't whitelisted, add as new GrawlixFilter
        filter = toGrawlixFilter(obj);
        if (filter.isValid()) {
          settings.filters.push(filter);
        }
      }
    });
  }
  return settings;
};
exports.loadFilters = loadFilters;

/**
 * Loads an array of style objects into the given GrawlixSettings instance
 * @param  {GrawlixSettings} settings GrawlixSettings object
 * @param  {Array}           styles   Array of style objects
 * @return {GrawlixSettings}
 */
var loadStyles = function(settings, styles) {
  if (_.isArray(styles) && styles.length > 0) {
    _.each(styles, function(obj) {
      if (!_.has(obj, 'name')) {
        return;
      }
      var style = _.findWhere(settings.styles, { name: obj.name });
      if (!_.isUndefined(style)) {
        style.configure(obj);
      } else {
        style = toGrawlixStyle(obj);
        if (style.isValid()) {
          settings.styles.push(style);
        }
      }
    });
  }
  return settings;
};
exports.loadStyles = loadStyles;

/**
 * Returns whether or not the given plugin has been added to the given options 
 * object.
 * @param  {String|GrawlixPlugin|Function}  plugin  Plugin name, GrawlixPlugin 
 *                                                  object, or factory function.
 * @param  {Object}                         options Options object.
 * @return {Boolean}
 */
exports.hasPlugin = function(plugin, options) {
  if (!_.has(options, 'plugins') || !_.isArray(options.plugins) || 
    _.isEmpty(options.plugins)) {
    return false;
  }
  var isNameMatch = function(name, info) {
    return (
      _.has(info, 'plugin') && _.isString(name) &&
      (
        (!_.isFunction(info.plugin) && info.plugin.name === name) || 
        (_.has(info, 'name') && info.name === name)
      )
    );
  };
  if (_.isFunction(plugin)) {
    return _.some(options.plugins, function(info) {
      return ( info.plugin === plugin );
    });
  } else if (plugin instanceof GrawlixPlugin) {
    return _.some(options.plugins, function(info) {
      return ( info.plugin === plugin || isNameMatch(plugin.name, info) );
    });
  }
  return _.some(options.plugins, function(info) {
    return isNameMatch(plugin, info);
  });
};

/**
 * Returns whether or not any of the given filters match the given string.
 * @param  {String}           str      Content string
 * @param  {GrawlixSettings}  settings GrawlixSettings object
 * @return {Boolean}                   Whether or not obscenity is found in the 
 *                                     given string
 */
exports.isMatch = function(str, settings) {
  if (settings.filters.length === 0) {
    return false;
  }
  return _.some(settings.filters, function(filter) {
    return filter.isMatch(str);
  });
};

/**
 * Replaces obscenities in the given string using the given settings.
 * @param  {String}          str      String to process
 * @param  {GrawlixSettings} settings Grawlix settings
 * @return {String}                   Processed string
 */
exports.replaceMatches = function(str, settings) {
  _.each(settings.filters, function(filter) {
    while (filter.isMatch(str)) {
      str = replaceMatch(str, filter, settings);
    }
  });
  return str;
};

/**
 * Replaces a filter match in a string
 * @param  {String}          str      Content string
 * @param  {GrawlixFilter}   filter   GrawlixFilter object
 * @param  {GrawlixSettings} settings GrawlixSettings object
 * @return {String}                   String with replacement applied
 */
var replaceMatch = function(str, filter, settings) {
  // get filter style if provided
  var style;
  if (filter.hasStyle() && settings.style.isOverrideAllowed) {
    style = _.findWhere(settings.styles, { name: filter.style });
  }
  if (_.isUndefined(style)) {
    // if filter style not found, or no filter style set, use main style
    style = settings.style;
  }
  // get replacement grawlix
  var repl;
  if (!settings.isRandom && style.hasFixed(filter.word)) {
    // if in fixed replacement mode and style has a defined fixed replacement 
    // string for the filter's word 
    repl = style.getFixed(filter.word);
  } else {
    // if single-character style
    repl = generateGrawlix(str, filter, style);
  }
  // apply filter template if necessary
  if (filter.hasTemplate()) {
    repl = filter.template(repl);
  }
  // replace the match
  return str.replace(filter.regex, repl);
};
exports.replaceMatch = replaceMatch;

/**
 * Replaces matched content with a grawlix, taking into account filter and style
 * settings.
 * @param  {String}        str       Content string
 * @param  {GrawlixFilter} filter    Filter object
 * @param  {GrawlixStyle}  style     Style object
 * @return {String}                  Grawlix replacement string
 */
var generateGrawlix = function(str, filter, style) {
  // determine length
  var len;
  if (filter.isExpandable) {
    len = filter.getMatchLen(str);
  } else {
    len = filter.word.length;
  }
  // generate grawlix
  if (!style.canRandomize()) {
    return style.getFillGrawlix(len);
  }
  return style.getRandomGrawlix(len);
};
exports.generateGrawlix = generateGrawlix;

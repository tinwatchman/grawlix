'use strict';

const _ = require('underscore');

const defaultFilters = require('./filters').filters;
const defaultStyles = require('./styles').styles;
const FilterSort = require('./filters').FilterSort;
const toGrawlixFilter = require('./filters').toGrawlixFilter;
const GrawlixStyle = require('./styles').GrawlixStyle;
const GrawlixPlugin = require('./plugin');

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
    return (!isAllowed && !isReplaced && filter.isValid());
  });
  // add option filters (if any) and/or configure filter options
  loadFilters(settings, options.filters, options.allowed);
  // load in default styles
  settings.styles = _.filter(defaultStyles, function(style) {
    return (style instanceof GrawlixStyle && style.isValid()); 
  });
  // load plugins (if we have any)
  if (options.plugins.length > 0) {
    _.each(options.plugins, function(pluginInfo) {
      loadPlugin(settings, pluginInfo, options);
    });
  }
  // sort filters
  settings.filters.sort(FilterSort);
  // get main style
  if (!_.has(options, 'style') || options.style === null) {
    throw new Error('grawlix style not defined!');
  }
  settings.style = getStyle(options, settings.styles);
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
  this.styles = null;
  this.loadedPlugins = [];
};
GrawlixSettings.prototype = {};
exports.GrawlixSettings = GrawlixSettings;

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
        settings.filters.push(filter);
      }
    });
  }
  return settings;
};
exports.loadFilters = loadFilters;

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
    plugin = pluginOrFunc(options, pluginOpts);
  } else if (pluginOrFunc instanceof GrawlixPlugin) {
    plugin = pluginOrFunc;
  }
  if (_.isUndefined(plugin)) {
    throw new Error('GrawlixPlugin not found!');
  } else if (!(plugin instanceof GrawlixPlugin)) {
    throw new Error('Provided object not a GrawlixPlugin!');
  }
  // initialize plugin
  plugin.init(pluginOpts);
  // load filters
  if (!_.isUndefined(plugin.filters) && _.isArray(plugin.filters)) {
    loadFilters(settings, plugin.filters, options.allowed);
  }
  // load styles
  if (plugin.styles.length > 0) {
    _.each(plugin.styles, function(style) {
      if ((style instanceof GrawlixStyle) && style.isValid()) {
        settings.styles.push(style);
      }
    });
  }
  // add to loaded plugins
  settings.loadedPlugins.push(plugin.name);
  // return
  return settings;
};
exports.loadPlugin = loadPlugin;

/**
 * Parses grawlix style options
 * @param  {Object}       options Options object
 * @param  {Array}        styles  Array of GrawlixStyle objects
 * @return {GrawlixStyle}         GrawlixStyle object
 */
var getStyle = function(options, styles) {
  if ((options.style instanceof GrawlixStyle) && options.style.isValid()) {
    return options.style;
  } else if (options.style instanceof GrawlixStyle) {
    throw new Error('grawlix style invalid!');
  }
  // look up style
  var style;
  if (!_.isString(options.style) && _.has(options.style, 'name')) {
    style = _.findWhere(styles, { name: options.style.name });
  } else {
    style = _.findWhere(styles, { name: options.style });
  }
  if (_.isUndefined(style)) {
    throw new Error('grawlix style not found!');
  }
  // check for style config options
  if (!_.isString(options.style) && _.isObject(options.style)) {
    parseStyleOptions(style, options.style);
  }
  // return style
  return style;
};
exports.getStyle = getStyle;

/**
 * Parses style options
 * @param  {GrawlixStyle} style        GrawlixStyle object
 * @param  {Object}       styleOptions Style options
 * @return {GrawlixStyle}
 */
var parseStyleOptions = function(style, styleOptions) {
  // parse style character options
  if (_.has(styleOptions, 'chars') && !_.isString(styleOptions.chars)) {
    if (_.has(styleOptions.chars, 'add')) {
      addStyleChars(style, styleOptions.chars.add);
    }
    if (_.has(styleOptions.chars, 'remove')) {
      removeStyleChars(style, styleOptions.chars.remove);
    }
    if (_.has(styleOptions.chars, 'replace') && 
        _.isObject(styleOptions.chars.replace)) {
      replaceStyleChars(style, styleOptions.chars.replace);
    }
  } else if (_.has(styleOptions, 'chars') && _.isString(styleOptions.chars)) {
    // replace all characters
    style.chars = styleOptions.chars;
  }
  // parse fixed replacement options
  if (_.has(styleOptions, 'fixed') && _.isObject(styleOptions.fixed) && 
      !_.isArray(styleOptions.fixed) && !_.isString(styleOptions.fixed)) {
    style.fixed = _.extend({}, style.fixed, styleOptions.fixed);
  }
  return style;
};
exports.parseStyleOptions = parseStyleOptions;

/**
 * Add given characters to style character string
 * @param {GrawlixStyle} style     GrawlixStyle object
 * @param {String}       additions Chars to add (will also accept Array)
 */
var addStyleChars = function(style, additions) {
  var addChars = _.isArray(additions) ? additions : additions.split('');
  _.each(addChars, function(newChar) {
    if (style.chars.indexOf(newChar) === -1) {
      style.chars += newChar;
    }
  });
  return style;
};
exports.addStyleChars = addStyleChars;

/**
 * Removes given characters from style character string
 * @param  {GrawlixStyle} style   Style object
 * @param  {String}       removes Chars to remove (will also accept Array)
 */
var removeStyleChars = function(style, removes) {
  var chars = style.chars.split('');
  var accepted = _.filter(chars, function(char) {
    return (removes.indexOf(char) === -1);
  });
  style.chars = accepted.join('');
  return style;
}
exports.removeStyleChars = removeStyleChars;

/**
 * Replaces characters within style character string
 * @param  {GrawlixStyle} style   GrawlixStyle object
 * @param  {Object}       charMap Map of characters, with keys representing 
 *                                chars to remove and values representing chars 
 *                                to add.
 * @return {GrawlixStyle}
 */
var replaceStyleChars = function(style, charMap) {
  _.each(charMap, function(newChar, oldChar) {
    removeStyleChars(style, oldChar);
    addStyleChars(style, newChar);
  });
  return style;
};
exports.replaceStyleChars = replaceStyleChars;

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
  // apply filter template if necessary
  if (filter.hasTemplate()) {
    repl = filter.template(repl);
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
  return generator(style.chars, len);
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

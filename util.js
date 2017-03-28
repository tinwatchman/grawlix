'use strict';

const _ = require('underscore');

const defaultFilters = require('./filters').filters;
const defaultStyles = require('./styles').styles;
const FilterSort = require('./filters').FilterSort;
const toGrawlixFilter = require('./filters').toGrawlixFilter;
const GrawlixStyle = require('./styles').GrawlixStyle;
const GrawlixPlugin = require('./plugin');

/**
 * Array of loaded plugin names
 * @private
 * @type {Array}
 */
var loadedPlugins = [];

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
  // before anything else, load plugins (if we have any)
  if (options.plugins.length > 0) {
    _.each(options.plugins, function(obj) {
      loadPlugin(obj, options);
    });
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
  if (!_.has(options, 'style') || options.style === null) {
    throw new Error('grawlix style not defined!');
  }
  settings.style = getStyle(options);
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
exports.GrawlixSettings = GrawlixSettings;

/**
 * Loads a plugin
 * @param  {GrawlixPlugin|Function} pluginOrFunc Grawlix plugin object or 
 *                                               factory function
 * @param  {Object}                 options      Options object
 * @return {void}
 */
var loadPlugin = function(pluginOrFunc, options) {
  // get plugin
  var plugin;
  if (_.isFunction(pluginOrFunc)) {
    plugin = pluginOrFunc(options);
  } else if (pluginOrFunc instanceof GrawlixPlugin) {
    plugin = pluginOrFunc;
  }
  if (_.isUndefined(plugin)) {
    throw new Error('GrawlixPlugin not provided!');
  } else if (!(plugin instanceof GrawlixPlugin)) {
    throw new Error('Provided object not a GrawlixPlugin!');
  } else if (hasPlugin(plugin.name)) {
    return;
  }
  // initialize plugin
  plugin.init(options);
  // load filters
  if (plugin.filters.length > 0) {
    _.each(plugin.filters, function(obj) {
      var filter;
      if (_.isObject(obj) && _.has(obj, 'word') && !_.has(obj, 'pattern')) {
        // configure default filter
        filter = _.findWhere(defaultFilters, { word: obj.word });
        if (!_.isUndefined(filter)) {
          filter.configure(obj);
        }
      } else {
        // add filter
        try {
          filter = toGrawlixFilter(obj);
        } catch (e) {
          return;
        }
        if (filter.isValid()) {
          defaultFilters.push(filter);
        }
      }
    });
  }
  // load styles
  if (plugin.styles.length > 0) {
    _.each(plugin.styles, function(style) {
      if ((style instanceof GrawlixStyle) && style.isValid()) {
        defaultStyles.push(style);
      }
    });
  }
  // add to loaded plugins
  loadedPlugins.push(plugin.name);
};
exports.loadPlugin = loadPlugin;

/**
 * Returns if named plugin has already been loaded
 * @param  {String}  name Plugin name
 * @return {Boolean}
 */
var hasPlugin = function(name) {
  return _.contains(loadedPlugins, name);
};
exports.hasPlugin = hasPlugin;

/**
 * Parses grawlix style options
 * @param  {Object}       options Options object
 * @return {GrawlixStyle}         GrawlixStyle object
 */
var getStyle = function(options) {
  if ((options.style instanceof GrawlixStyle) && options.style.isValid()) {
    return options.style;
  } else if (options.style instanceof GrawlixStyle) {
    throw new Error('grawlix style invalid!');
  }
  // look up style
  var style;
  if (!_.isString(options.style) && _.has(options.style, 'name')) {
    style = _.findWhere(defaultStyles, { name: options.style.name });
  } else {
    style = _.findWhere(defaultStyles, { name: options.style });
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

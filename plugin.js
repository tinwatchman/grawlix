'use strict';

/**
 * Contains the specification class for grawlix plugins
 */

const _ = require('underscore');

/**
 * Defines a grawlix plugin.
 * @param {Object}   obj         Constructor options
 * @param {String}   obj.name    Plugin name. Required.
 * @param {Array}    obj.filters Array of filter objects. Optional.
 * @param {Array}    obj.styles  Array of grawlix styles. Optional.
 * @param {Function} obj.init    Initialization function override. Optional.
 */
const GrawlixPlugin = function(obj) {
  /**
   * Plugin name
   * @type {String}
   */
  this.name = null;

  /**
   * Array of filter objects
   * @type {Array}
   */
  this.filters = [];

  /**
   * Array of GrawlixStyle objects
   * @type {Array}
   */
  this.styles = [];

  /**
   * Optional initialization function. Called when plugin first loaded. Can be
   * overridden in subclasses or via the `obj` argument. Value of `this` inside 
   * the function will always be the `GrawlixPlugin` instance.
   * @param  {Object} options Options object of the main `grawlix` instance.
   * @return {void}
   */
  this.init = function(options) {
    // can override in subclasses
  };

  if(!_.isUndefined(obj) && _.isString(obj)) {
    this.name = obj;
  } else if (!_.isUndefined(obj) && !_.isString(obj) && _.has(obj, 'name')) {
    this.name = obj.name;
  }
  if (!_.isUndefined(obj) && _.has(obj, 'filters') && _.isArray(obj.filters)) {
    this.filters = obj.filters;
  }
  if (!_.isUndefined(obj) && _.has(obj, 'styles') && _.isArray(obj.styles)) {
    this.styles = obj.styles;
  }
  if (!_.isUndefined(obj) && _.has(obj, 'init') && _.isFunction(obj.init)) {
    this.init = _.bind(obj.init, this);
  }
};
GrawlixPlugin.prototype = {};

/**
 * Custom Error subclass for Grawlix plugin exceptions
 * @param {Object} args            Arguments
 * @param {String} args.msg        Error message. Required.
 * @param {Object} args.plugin     Plugin object or plugin. Optional.
 * @param {Error}  args.baseError  An error that caused or is related to the 
 *                                 plugin error. Optional.
 */
const GrawlixPluginError = function(args) {
  this.name = 'GrawlixPluginError';
  this.plugin = _.has(args, 'plugin') ? args.plugin : null;
  if (_.has(args, 'baseError')) {
    this.baseError = args.baseError;
  }
  this.stack = (new Error()).stack;
  if (this.plugin !== null) {
    this.message = 'grawlix plugin error: ' + args.msg + '\n' + 
                   JSON.stringify(this.plugin, null, 4);
  } else {
    this.message = 'grawlix plugin error: ' + args.msg;
  }
  if (!_.isUndefined(this.baseError)) {
    this.message += '\nbase error - ' + this.baseError.message;
  }
};
GrawlixPluginError.prototype = Object.create(Error.prototype);
GrawlixPluginError.prototype.constructor = GrawlixPluginError;

/**
 * Exports
 */
module.exports = {
  GrawlixPlugin: GrawlixPlugin,
  GrawlixPluginError: GrawlixPluginError
};

'use strict';

/**
 * Contains the specification class for grawlix plugins
 */

const _ = require('underscore');

/**
 * Defines a grawlix plugin.
 * @param {Object}   obj         Constructor options. Optional.
 * @param {String}   obj.name    Plugin name. Optional.
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
 * Export
 */
module.exports = GrawlixPlugin;

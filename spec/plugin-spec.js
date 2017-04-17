'use strict';

const GrawlixPlugin = require('../plugin').GrawlixPlugin;
const GrawlixStyle = require('../styles').GrawlixStyle;
const _ = require('underscore');

describe('GrawlixPlugin', function() {
  describe('#constructor', function() {
    it('should be fine without any arguments provided', function() {
      var plugin = new GrawlixPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.filters).toBeDefined();
      expect(_.isArray(plugin.filters)).toBe(true);
      expect(plugin.styles).toBeDefined();
      expect(_.isArray(plugin.styles)).toBe(true);
      expect(plugin.init).toBeDefined();
      expect(_.isFunction(plugin.init)).toBe(true);
    });
    it('should accept a name option', function() {
      var plugin = new GrawlixPlugin({
        name: 'my-plugin'
      });
      expect(plugin.name).toEqual('my-plugin');
    });
    it('should accept a string', function() {
      var plugin = new GrawlixPlugin('my-plugin');
      expect(plugin.name).toEqual('my-plugin');
    });
    it('should accept a filters option (if an array)', function() {
      var filter = { word: 'word', pattern: /word/i };
      var filter2 = { word: 'word2', pattern: /word2/i };
      var plugin = new GrawlixPlugin({
        filters: [ filter, filter2 ]
      });
      var plugin2 = new GrawlixPlugin({
        filters: {
          filter: filter,
          filter2: filter2
        }
      });
      expect(plugin.filters.length).toBe(2);
      expect(plugin.filters[0]).toBe(filter);
      expect(plugin.filters[1]).toBe(filter2);
      expect(plugin2.filters.length).toBe(0);
    });
    it('should accept a styles option (if an array)', function() {
      var javaStyle = new GrawlixStyle('java', '☕');
      var rookStyle = new GrawlixStyle('rook', '♜');
      var plugin = new GrawlixPlugin({
        styles: [
          javaStyle,
          rookStyle
        ]
      });
      var plugin2 = new GrawlixPlugin({
        styles: {
          0: javaStyle,
          1: rookStyle
        }
      });
      expect(plugin.styles.length).toBe(2);
      expect(plugin.styles[0]).toBe(javaStyle);
      expect(plugin.styles[1]).toBe(rookStyle);
      expect(plugin2.styles.length).toBe(0);
    });
    it('should accept an init function (if a function)', function() {
      var isChanged = false;
      var init = function(options) {
        isChanged = true;
      };
      var plugin = new GrawlixPlugin({
        init: init
      });
      var plugin2 = new GrawlixPlugin({
        init: {} // should ignore this, keep the default
      });
      expect(plugin.init).toBeDefined();
      expect(_.isFunction(plugin.init)).toBe(true);
      expect(plugin2.init).toBeDefined();
      expect(_.isFunction(plugin2.init)).toBe(true);
      plugin.init();
      plugin2.init();
      expect(isChanged).toBe(true);
    });
  });
  
  describe('#init', function() {
    it('should always have `this` set to the plugin instance', function() {
      var plugin = new GrawlixPlugin({
        init: function(options) {
          options.x++;
          options.self = this;
        }
      });
      var opts = { x: 0 };
      plugin.init(opts);
      expect(opts.x).toEqual(1);
      expect(opts.self).toBeDefined();
      expect(opts.self).toBe(plugin);
    });
  });
});

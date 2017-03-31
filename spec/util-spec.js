'use strict';

const _ = require('underscore');
const util = require('../util');
const Style = require('../styles').Style;
const GrawlixStyle = require('../styles').GrawlixStyle;
const GrawlixSettings = require('../util').GrawlixSettings;
const GrawlixFilter = require('../filters').GrawlixFilter;
const GrawlixPlugin = require('../plugin');
const defaultFilters = require('../filters').filters;
const defaultStyles = require('../styles').styles;

describe('GrawlixUtil', function() {

  describe('#getFillGrawlix', function() {
    it('should return a string of the given length', function() {
      var r = util.getFillGrawlix('*', 16);
      expect(_.isString(r)).toBe(true);
      expect(r).toEqual('****************');
    });
    it('should default to the first char if given a string', function() {
      var r = util.getFillGrawlix('*!', 16);
      expect(r).toEqual('****************');
    });
    it('should work on unicode', function() {
      var r = util.getFillGrawlix('☠', 16);
      expect(r).toEqual('☠☠☠☠☠☠☠☠☠☠☠☠☠☠☠☠');
    });
  });

  describe('#getRandomGrawlix', function() {
    it('should always return a grawlix of the given length', function() {
      var grawlixChars = '!@#$%^&*';
      var nonGrawlixChars = /[^\!\@\#\$\%\^\&\*]/gi;
      var a = util.getRandomGrawlix(grawlixChars, 4);
      var b = util.getRandomGrawlix(grawlixChars, 10);
      var c = util.getRandomGrawlix(grawlixChars, 32);
      expect(_.isString(a)).toBe(true);
      expect(a.length).toEqual(4);
      expect(a).not.toMatch(nonGrawlixChars);
      expect(_.isString(b)).toBe(true);
      expect(b.length).toEqual(10);
      expect(b).not.toMatch(nonGrawlixChars);
      expect(_.isString(c)).toBe(true);
      expect(c.length).toEqual(32);
      expect(c).not.toMatch(nonGrawlixChars);
    });

    it('should never repeat characters', function() {
      var numTrials = 10000;
      var chars = '!@#$%★☒☎☠☢☣☹♡♢♤♧';
      var dbls = _.map(chars.split(''), function(char) {
        return char + char;
      });
      for (var i=0; i<numTrials; i++) {
          var r = util.getRandomGrawlix(chars, 16);
          for (var n=0; n<dbls.length; n++) {
              expect(r).not.toContain(dbls[n]);
          }
      }
    });

    it('should never output a grawlix that ends on a !', function() {
      var numTrials = 10000;
      var chars = '!@#$%';
      for (var i=0; i<numTrials; i++) {
          var r = util.getRandomGrawlix(chars, 16);
          expect(r.charAt(15)).not.toEqual('!');
      };
    });
  });

  describe('#loadFilters', function() {
    var settings;

    beforeEach(function() {
      settings = new GrawlixSettings();
      settings.filters = [];
    });

    it('should skip over objects without `word` properties', function() {
      var filters = [
        { word: 'somesuch', pattern: /somesuch/i },
        { }
      ];
      util.loadFilters(settings, filters, []);
      expect(settings.filters.length).toEqual(1);
    });

    it('should configure existing filters', function() {
      var filter = new GrawlixFilter('somesuch', /somesuch/i, {
        priority: 10
      });
      settings.filters = [ filter ];
      var filters = [
        {
          word: 'somesuch',
          priority: 5
        }
      ];
      util.loadFilters(settings, filters, []);
      expect(filter.priority).toEqual(5);
    });

    it('should not throw an error if filter to config is not found', function(){
      var filters = [
        {
          word: 'somesuch',
          priority: 5
        }
      ];
      var testFunc = function() {
        util.loadFilters(settings, filters, []);
      };
      expect(testFunc).not.toThrow();
    });

  });

  describe('#hasPlugin', function() {

    it('should return false if plugin with given name not found', () => {
      expect(util.hasPlugin('null-plugin', {})).toBe(false);
      expect(util.hasPlugin('null-plugin', { plugins: [] })).toBe(false);
      expect(util.hasPlugin(
        'null-plugin', 
        {
          plugins: [
            { plugin: new GrawlixPlugin('blank-plugin') }
          ]
        }
      )).toBe(false);
    });

    it('should return true if GrawlixPlugin with given name is found', () => {
      var r = util.hasPlugin('blank-plugin', {
        plugins: [
          {
            plugin: new GrawlixPlugin('blank-plugin')
          }
        ]
      });
      expect(r).toBe(true);
    });

    it('should return true if given GrawlixPlugin is found', function() {
      var plugin = new GrawlixPlugin('blank-plugin');
      var r = util.hasPlugin(plugin, {
        plugins: [
          { plugin: plugin }
        ]
      });
      expect(r).toBe(true);
    });

    it('should return true if GrawlixPlugin with same name found', () => {
      var plugin = new GrawlixPlugin('blank-plugin');
      var options = {
        plugins: [
          {
            plugin: new GrawlixPlugin('blank-plugin')
          }
        ]
      };
      expect(util.hasPlugin(plugin, options)).toBe(true);
    });

    it('should return true if same factory function found', function() {
      var factory = function(options) {
        return new GrawlixPlugin('blank-plugin');
      };
      var options = {
        plugins: [
          {
            plugin: factory
          }
        ]
      };
      expect(util.hasPlugin(factory, options)).toBe(true);
    });

    it('should return true if factory with given name found', function() {
      var options = {
        plugins: [
          {
            plugin: function(options) {
              return new GrawlixPlugin('blank-plugin'); 
            },
            name: 'blank-plugin'
          }
        ]
      };
      expect(util.hasPlugin('blank-plugin', options)).toBe(true);
    });

    it("should return true if factory with given plugin's name found", () => {
      var plugin = new GrawlixPlugin('blank-plugin');
      var options = {
        plugins: [
          {
            plugin: function(options) {
              return new GrawlixPlugin('blank-plugin'); 
            },
            name: 'blank-plugin'
          }
        ]
      };
      expect(util.hasPlugin(plugin, options)).toBe(true);
    });

  });

  describe('#loadPlugin', function() {
    var settings;

    beforeEach(function() {
      settings = new GrawlixSettings();
      settings.filters = _.clone(defaultFilters);
      settings.styles = _.clone(defaultStyles);
    });

    it('should throw an error if not a GrawlixPlugin', function() {
      var testFunc = function() {
        util.loadPlugin(settings, {}, {});
      };
      expect(testFunc).toThrow();
    });

    it("should throw if factory function doesn't return a GrawlixPlugin", ()=>{
      var badFactoryFunc = function(options, pluginOptions) {
        return {};
      };
      var testFunc = function() {
        util.loadPlugin(settings, badFactoryFunc, {});
      };
      expect(testFunc).toThrow();
    });

    it('should accept factory functions', function() {
      var factory = function(options, pluginOptions) {
        options.isOptionsPassed = _.has(options, 'isFactoryRun');
        options.isPluginOptionsPassed = _.has(pluginOptions, 'isPluginOptions');
        options.isFactoryRun = true;
        return new GrawlixPlugin({
          name: 'blank-plugin'
        });
      };
      var options = { 
        isFactoryRun: false,
        isOptionsPassed: false,
        isPluginOptionsPassed: false
      };
      var pluginInfo = {
        plugin: factory,
        options: {
          isPluginOptions: true
        }
      };
      util.loadPlugin(settings, pluginInfo, options);
      expect(settings.loadedPlugins).toContain('blank-plugin');
      expect(options.isFactoryRun).toBe(true);
      expect(options.isOptionsPassed).toBe(true);
      expect(options.isPluginOptionsPassed).toBe(true);
    });

    it('should accept new (valid) filters', function() {
      var plugin = new GrawlixPlugin({
        name: 'my-damn-plugin',
        filters: [
          {
            word: 'damn',
            pattern: /\bd[a@]mn/i
          }
        ]
      });
      util.loadPlugin(settings, plugin, {});
      var damnFilter = _.findWhere(settings.filters, { word: 'damn' });
      expect(settings.loadedPlugins).toContain('my-damn-plugin');
      expect(damnFilter).toBeDefined();
    });

    it('should allow filter configuration', function() {
      var plugin = new GrawlixPlugin({
        name: 'my-reconfig-plugin',
        filters: [{
          word: 'bastard',
          expandable: false
        }]
      });
      util.loadPlugin(settings, plugin, {});
      var bastardFilter = _.findWhere(settings.filters, { word: 'bastard'});
      expect(settings.loadedPlugins).toContain('my-reconfig-plugin');
      expect(bastardFilter).toBeDefined();
      expect(bastardFilter.isExpandable).toBe(false);
    });

    it('should not throw if plugin.filters is not an array', function() {
      var plugin = new GrawlixPlugin('bad-plugin');
      plugin.filters = null;
      var testFunc = function() {
        util.loadPlugin(settings, plugin, {});
      };
      expect(testFunc).not.toThrow();
    });

    it("shouldn't throw if plugin info doesn't have options", function() {
      var testFunc = function() {
        util.loadPlugin(settings, {
          plugin: new GrawlixPlugin('blank-plugin')
        }, {});
      };
      expect(testFunc).not.toThrow();
    });

    it('should accept new (valid) styles', function() {
      var cloudStyle = new GrawlixStyle('clouds', '☁');
      var nedStyle = new GrawlixStyle('ned-flanders', null, {
        cocksucker: 'ding-dong-diddly'
      });
      var badStyle = new GrawlixStyle('bad-style', null);
      var plugin = new GrawlixPlugin({
        name: 'test-styles-plugin',
        styles: [
          cloudStyle,
          nedStyle,
          badStyle
        ]
      });
      util.loadPlugin(settings, plugin, {});
      var defClouds = _.findWhere(settings.styles, { name: 'clouds' });
      var defNed = _.findWhere(settings.styles, { name: 'ned-flanders' });
      var defBad = _.findWhere(settings.styles, { name: 'bad-style' });
      expect(defClouds).toBeDefined();
      expect(defClouds).toBe(cloudStyle);
      expect(defNed).toBeDefined();
      expect(defNed).toBe(nedStyle);
      expect(defBad).not.toBeDefined();
    });

    // tear down
    afterAll(function() {
      var bastardFilter = _.findWhere(settings.filters, { word: 'bastard'});
      bastardFilter.isExpandable = true;
    });

  });

  describe('#addStyleChars', function() {
    // setup
    var style;
    beforeEach(function() {
      style = new GrawlixStyle('style', '!@#$%', {});
    });

    it('should add given characters to the style', function() {
      util.addStyleChars(style, '^&*');
      expect(style.chars).toContain('^');
      expect(style.chars).toContain('&');
      expect(style.chars).toContain('*');
    });

    it('should also accept an Array of chars as 2nd argument', function() {
      util.addStyleChars(style, ['^', '&', '*']);
      expect(style.chars).toContain('^');
      expect(style.chars).toContain('&');
      expect(style.chars).toContain('*');
    });

    it('should not add characters already in the style', function() {
      util.addStyleChars(style, '%');
      expect(style.chars).not.toContain('%%');
    });
  });

  describe('#removeStyleChars', function() {
    // setup
    var style;
    beforeEach(function() {
      style = new GrawlixStyle('style', '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡', {});
    });

    it('should remove given characters from style', function() {
      util.removeStyleChars(style, '♡♢♧⚡');
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).not.toContain('⚡');
    });

    it('should also accept an array of chars as 2nd argument', function() {
      util.removeStyleChars(style, ['♡','♢','♧','⚡']);
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).not.toContain('⚡');
    });
  });

  describe('#replaceStyleChars', function() {
    it('should replace object keys with object values', function() {
      var style = new GrawlixStyle('style', '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡', {});
      util.replaceStyleChars(style, {
        '♡': '♥',
        '♢': '♦',
        '♤': '♠',
        '♧': '♣'
      });
      expect(style.chars).not.toContain('♡');
      expect(style.chars).toContain('♥');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).toContain('♦');
      expect(style.chars).not.toContain('♤');
      expect(style.chars).toContain('♠');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).toContain('♣');
    });
  });

  describe('#parseStyleOptions', function() {
    // setup
    var style;
    beforeEach(function() {
      // characters to add: ⚓⚔⚑⚡
      style = new GrawlixStyle('style', '★☒☎☠☢☣☹♡♢♤♧', {
        word1: 'w0rd1',
        word2: 'w0rd2'
      });
    });

    it('should add characters passed in chars.add', function() {
      util.parseStyleOptions(style, {
        chars: {
          add: '⚓⚔⚑⚡'
        }
      });
      expect(style.chars).toContain('⚓');
      expect(style.chars).toContain('⚔');
      expect(style.chars).toContain('⚑');
      expect(style.chars).toContain('⚡');
    });

    it('should remove characters passed in chars.remove', function() {
      util.parseStyleOptions(style, {
        chars: {
          remove: '♡♢♤♧'
        }
      });
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♤');
      expect(style.chars).not.toContain('♧');
    });

    it('should replace characters passed in chars.replace', function() {
      util.parseStyleOptions(style, {
        chars: {
          replace: {
            '♡': '♥',
            '♢': '♦',
            '♤': '♠',
            '♧': '♣'
          }
        }
      });
      expect(style.chars).not.toContain('♡');
      expect(style.chars).toContain('♥');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).toContain('♦');
      expect(style.chars).not.toContain('♤');
      expect(style.chars).toContain('♠');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).toContain('♣');
    });

    it('should replace everything if chars is a string', function() {
      util.parseStyleOptions(style, {
        chars: 'x'
      });
      expect(style.chars).toEqual('x');
    });

    it('should add or replace fixed replacements passed in fixed', function() {
      util.parseStyleOptions(style, {
        fixed: {
          word1: 'wordOne',
          word3: 'w0rd3'
        }
      });
      expect(_.has(style.fixed, 'word1')).toBe(true);
      expect(style.fixed.word1).toEqual('wordOne');
      expect(_.has(style.fixed, 'word3')).toBe(true);
      expect(style.fixed.word3).toEqual('w0rd3');
      // check to make sure word2 is still there / hasn't been modified
      expect(_.has(style.fixed, 'word2')).toBe(true);
      expect(style.fixed.word2).toEqual('w0rd2');
    });
  });

  describe('#getStyle', function() {

    it('should return the value when style is a GrawlixStyle object', () => {
      var style = new GrawlixStyle('x-style', 'x');
      var r = util.getStyle({'style': style}, defaultStyles);
      expect(r).toBe(style);
    });

    it('should return the named style when given a String', function() {
      var r = util.getStyle({style: 'unicode'}, defaultStyles);
      expect(r instanceof GrawlixStyle).toBe(true);
      expect(r.name).toEqual('unicode');
    });

    it('should return the named style when given an Object', function() {
      var r = util.getStyle({
        style: {
          name: Style.UNICODE
        }
      }, defaultStyles);
      expect(r instanceof GrawlixStyle).toBe(true);
      expect(r.name).toEqual('unicode');
    });

    it('should throw an error when given an invalid style name', function() {
      var testFunc = function() {
        return util.getStyle({
          style: 'got-no-style-got-no-class'
        }, defaultStyles);
      };
      expect(testFunc).toThrow();
    });

    it('should throw an error when given an invalid style', function() {
      var testFunc = function() {
        return util.getStyle({
          style: new GrawlixStyle(null, null)
        }, defaultStyles);
      };
      expect(testFunc).toThrow();
    });

  });

  describe('#parseOptions', function() {

    it('should throw an error when style is not defined', function() {
      var testFunc = function() {
        var settings = util.parseOptions({
          randomize: true,
          allowed: [],
          filters: [],
          plugins: []
        });
      };
      expect(testFunc).toThrow();
    });

    it('should allow plugins to be loaded', function() {
      // standard plugin
      var standardPlugin = new GrawlixPlugin({
        name: 'blank-plugin-1',
        init: function(opts) {
          opts.isLoaded = true;
        }
      });
      // factory function plugin
      var factFunc = function(options) {
        options.isFactoryFunctionRun = true;
        return new GrawlixPlugin({
          name: 'blank-plugin-2',
          init: function(opts) {
            opts.isLoaded = true;
          }
        });
      };
      // parse options
      var opts = {
        randomize: true,
        style: 'ascii',
        allowed: [],
        filters: [],
        plugins: [
          {
            plugin: standardPlugin,
            options: {
              isLoaded: false
            }
          },
          {
            plugin: factFunc,
            options: {
              isLoaded: false
            }
          }
        ]
      };
      var settings = util.parseOptions(opts);
      expect(settings.loadedPlugins).toContain('blank-plugin-1');
      expect(settings.loadedPlugins).toContain('blank-plugin-2');
      expect(opts.isFactoryFunctionRun).toBeDefined();
      expect(opts.isFactoryFunctionRun).toBe(true);
      expect(opts.plugins[0].options.isLoaded).toBe(true);
      expect(opts.plugins[1].options.isLoaded).toBe(true);
    });

  });

  describe('#isMatch', function() {

    it('should return false when no filters are given', function() {
      var settings = new GrawlixSettings();
      settings.filters = [];
      expect(util.isMatch('shitshow', settings)).toBe(false);
    });

    it('should return true when a filter matches the given string', function() {
      var testStr = 'oh my god this fucking cat';
      var settings = new GrawlixSettings();
      settings.filters = [
        new GrawlixFilter(
          'fuck',
          /f+u+c+k+/i
        )
      ];
      expect(util.isMatch(testStr, settings)).toBe(true);
    });

    it('should return false if no filter matches the given string', function() {
      var testStr = 'i got blisters on my fingers';
      var settings = new GrawlixSettings();
      settings.filters = [
        new GrawlixFilter(
          'word',
          /word/i
        ),
        new GrawlixFilter(
          'beatles',
          /beatles/i
        )
      ];
      expect(util.isMatch(testStr, settings)).toBe(false);
    });

  });

});
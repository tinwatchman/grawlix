'use strict';

const _ = require('underscore');
const util = require('../util');
const Style = require('../styles').Style;
const GrawlixStyle = require('../styles').GrawlixStyle;
const GrawlixSettings = require('../util').GrawlixSettings;
const GrawlixFilter = require('../filters').GrawlixFilter;
const GrawlixPlugin = require('../plugin').GrawlixPlugin;
const defaultFilters = require('../filters').filters;
const defaultStyles = require('../styles').styles;

describe('GrawlixUtil', function() {

  describe('#loadFilters', function() {
    var settings;

    beforeEach(function() {
      settings = new GrawlixSettings();
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

    it('should not load filters on allowed whitelist', function() {
      var filters = [
        {
          word: 'badword',
          pattern: /badword/i
        }
      ];
      util.loadFilters(settings, filters, [ 'badword' ]);
      expect(settings.filters.length).toEqual(0);
    });

  });

  describe('#loadStyles', function() {

    it('should process valid style objects', function() {
      var settings = new GrawlixSettings();
      var styles = [
        {
          name: 'clouds', 
          char: '☁' 
        },
        {
          name: 'ned-flanders',
          fixed: {
            word: 'ding-dong-diddly'
          }
        }
      ];
      util.loadStyles(settings, styles);
      var cloudStyle = _.findWhere(settings.styles, { name: 'clouds' });
      var nedStyle = _.findWhere(settings.styles, { name: 'ned-flanders' });
      expect(cloudStyle).toBeDefined();
      expect(nedStyle).toBeDefined();
      expect(settings.styles.length).toEqual(2);
    });

    it('should ignore styles without defined names', function() {
      var settings = new GrawlixSettings();
      util.loadStyles(settings, [ {}, {}, {} ]);
      expect(settings.styles.length).toEqual(0);
    });

    it('should configure existing styles', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%★☒☎☠☢☣☹♡♢♤♧'
      });
      var settings = new GrawlixSettings();
      settings.styles = [ style ];
      util.loadStyles(settings, [
        {
          name: 'style',
          randomChars: {
            remove: '!@#$%'
          }
        }
      ]);
      expect(settings.styles.length).toBe(1);
      expect(style.chars).toEqual('★☒☎☠☢☣☹♡♢♤♧');
    });

    it('should throw an error on an invalid style object', function() {
      var testFunc = function() {
        util.loadStyles(new GrawlixSettings(), [
          { name: 'bad-style' }
        ]);
      };
      expect(testFunc).toThrow();
    });

  });

  describe('#loadPlugin', function() {
    var settings;

    beforeEach(function() {
      settings = new GrawlixSettings();
      settings.filters = _.map(defaultFilters, function(filter) {
        return filter.clone();
      });
      settings.styles = _.map(defaultStyles, function(style) {
        return style.clone();
      });
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
      var factory = function(pluginOptions, options) {
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

    it("shouldn't throw if plugin info doesn't have options", function() {
      var testFunc = function() {
        util.loadPlugin(settings, {
          plugin: new GrawlixPlugin('blank-plugin')
        }, {});
      };
      expect(testFunc).not.toThrow();
    });

    it('should throw if an error occurs when loading filters', function() {
      var badPlugin = new GrawlixPlugin({
        name: 'bad-plugin',
        filters: [
          {
            word: 'bad-word',
            pattern: 'bad-word'
          }
        ]
      });
      var testFunc = function() {
        util.loadPlugin(settings, { plugin: badPlugin }, {});
      };
      expect(testFunc).toThrow();
    });

    it('should throw if an error occurs loading styles', function() {
      var badPlugin = new GrawlixPlugin({
        name: 'bad-plugin',
        styles: [
          {
            name: '',
            char: '*'
          }
        ]
      });
      var testFunc = function() {
        util.loadPlugin(settings, { plugin: badPlugin }, {});
      };
      expect(testFunc).toThrow();
    });

    it('should accept new (valid) styles', function() {
      var initNumStyles = settings.styles.length;
      var plugin = new GrawlixPlugin({
        name: 'test-styles-plugin',
        styles: [
          {
            name: 'clouds', 
            char: '☁' 
          },
          {
            name: 'ned-flanders',
            fixed: {
              cocksucker: 'ding-dong-diddly'
            }
          },
          {}
        ]
      });
      util.loadPlugin(settings, plugin, {});
      var cloudStyle = _.findWhere(settings.styles, { name: 'clouds' });
      var nedStyle = _.findWhere(settings.styles, { name: 'ned-flanders' });
      expect(cloudStyle).toBeDefined();
      expect(nedStyle).toBeDefined();
      expect(settings.styles.length).toEqual(initNumStyles + 2);
    });

    it('should throw an error when provided an invalid GrawlixPlugin', ()=>{
      var testFunc = function() {
        var plugin = {
          plugin: new GrawlixPlugin({
            name: null
          })
        };
        util.loadPlugin(settings, plugin, {});
      };
      expect(testFunc).toThrow();
    });

    it('should ignore plugins with invalid .filters property', function() {
      var plug = new GrawlixPlugin({
        name: 'plugin'
      });
      plug.filters = null;
      var testFunc = function() {
        var plugin = {
          plugin: plug
        };
        util.loadPlugin(settings, plugin, {});
      };
      expect(testFunc).not.toThrow();
    });

    it('should ignore plugins with invalid .styles property', function() {
      var plug = new GrawlixPlugin({
        name: 'plugin'
      });
      plug.styles = null;
      var testFunc = function() {
        var plugin = {
          plugin: plug
        };
        util.loadPlugin(settings, plugin, {});
      };
      expect(testFunc).not.toThrow();
    });

    // tear down
    afterAll(function() {
      var bastardFilter = _.findWhere(settings.filters, { word: 'bastard'});
      bastardFilter.isExpandable = true;
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

    it('should throw an error when style cannot be found', function() {
      var testFunc = function() {
        var settings = util.parseOptions({
          randomize: true,
          allowed: [],
          filters: [],
          plugins: [],
          styles: [],
          style: {
            name: 'Bladorfagorf',
            allowOverride: false
          }
        });
        expect(testFunc).toThrow();
      };
    });

    it('should allow main style configuration', function() {
      var settings = util.parseOptions({
        randomize: true,
        allowed: [],
        filters: [],
        plugins: [],
        styles: [],
        style: {
          name: 'ascii',
          allowOverride: false
        }
      });
      expect(settings.style).not.toBe(null);
      expect(settings.style.name).toEqual('ascii');
      expect(settings.style.isOverrideAllowed).toBe(false);
    });

    it('should allow a new main style to be created', function() {
      var settings = util.parseOptions({
        randomize: true,
        allowed: [],
        filters: [],
        plugins: [],
        styles: [],
        style: {
          name: 'tilde',
          char: '~'
        }
      });
      expect(settings.style).not.toBe(null);
      expect(settings.style.name).toEqual('tilde');
      expect(settings.style.canRandomize()).toBe(false);
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
      var factFunc = function(pluginOptions, options) {
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

    it('should allow default filters to be replaced', function() {
      var replRegex = /bastard/i;
      var opts = {
        filters: [
          {
            word: 'bastard',
            pattern: replRegex
          }
        ],
        style: 'ascii',
        randomize: true,
        plugins: [],
        styles: [],
        allowed: []
      };
      var settings = util.parseOptions(opts);
      var bastardFilter = _.findWhere(settings.filters, { word: 'bastard' });
      expect(bastardFilter).toBeDefined();
      expect(bastardFilter.regex).toBe(replRegex);
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

  describe('#generateGrawlix', function() {
    var mockFilter;
    var mockStyle;

    beforeEach(function() {
      mockFilter = {
        word: 'badword',
        isExpandable: false,
        methodCalls: {
          getMatchLen: 0
        },
        getMatchLen: function(str) {
          this.methodCalls.getMatchLen++;
          return 7;
        }
      };
      mockStyle = {
        name: 'style',
        methodCalls: {
          canRandomize: 0,
          getFillGrawlix: 0,
          getRandomGrawlix: 0
        },
        _canRandomize: true,
        _fillGrawlix: 'xxxxxxx',
        _randomGrawlix: 'xiixiix',
        canRandomize: function() {
          this.methodCalls.canRandomize++;
          return this._canRandomize;
        },
        getFillGrawlix: function(len) {
          this.methodCalls.getFillGrawlix++;
          return this._fillGrawlix;
        },
        getRandomGrawlix: function(len) {
          this.methodCalls.getRandomGrawlix++;
          return this._randomGrawlix;
        }
      };
    });

    it('should call filter.getMatchLen if filter.isExpandable', ()=>{
      mockFilter.isExpandable = true;
      util.generateGrawlix('something badword', mockFilter, mockStyle);
      expect(mockFilter.methodCalls.getMatchLen).toEqual(1);
    });

    it('should not call filter.getMatchLen if isExpandable is false', ()=> {
      util.generateGrawlix('something badword', mockFilter, mockStyle);
      expect(mockFilter.methodCalls.getMatchLen).toEqual(0);
    });

    it('should call getRandomGrawlix if canRandomize is true', function() {
      var s = util.generateGrawlix('something badword', mockFilter, mockStyle);
      expect(_.isString(s)).toBe(true);
      expect(s).toEqual(mockStyle._randomGrawlix);
      expect(mockStyle.methodCalls.getRandomGrawlix).toEqual(1);
    });

    it('should call getFillGrawlix if canRandomize is false', function() {
      mockStyle._canRandomize = false;
      var s = util.generateGrawlix('something badword', mockFilter, mockStyle);
      expect(s).toEqual(mockStyle._fillGrawlix);
      expect(mockStyle.methodCalls.getFillGrawlix).toEqual(1);
      expect(mockStyle.methodCalls.getRandomGrawlix).toEqual(0);
    });

  });

  describe('#replaceMatch', function() {

    it('should allow filter styles', function() {
      var settings = new GrawlixSettings();
      settings.styles = _.map(defaultStyles, function(style) {
        return style.clone();
      });
      settings.style = _.findWhere(settings.styles, { name: 'ascii' });
      var filter = new GrawlixFilter('badword', /badword/i, {
          style: 'asterix'
      });
      var r = util.replaceMatch('uh oh badword', filter, settings);
      expect(r).toEqual('uh oh *******');
    });

    it('should not use a filter style when cannot override main style', ()=>{
      var settings = new GrawlixSettings();
      settings.styles = _.map(defaultStyles, function(style) {
        var clone = style.clone();
        if (style.name === 'ascii') {
          clone.isOverrideAllowed = false;
          settings.style = clone;
        }
        return clone;
      });
      var filter = new GrawlixFilter('badword', /badword/i, {
          style: 'asterix'
      });
      var r = util.replaceMatch('uh oh badword', filter, settings);
      expect(r).not.toEqual('uh oh *******');
    });

  });
  
});
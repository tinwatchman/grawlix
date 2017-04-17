'use strict';

const _ = require('underscore');
var GrawlixStyle = require('../styles').GrawlixStyle;
var toGrawlixStyle = require('../styles').toGrawlixStyle;
var GrawlixStyleError = require('../styles').GrawlixStyleError;

/**
 * GrawlixStyle class unit tests
 */
describe('GrawlixStyle', function() {

  describe('#isValid', function() {
    it('should be true when both name and chars are set', function() {
      var style = new GrawlixStyle('style', { randomChars: '!@#$' });
      expect(style.isValid()).toBe(true);
    });
    it('should be true when both name and at least one fixed replacement is ' + 
       ' set', function() {
      var style = new GrawlixStyle('style', {
        fixed: { word: '#!$@' }
      });
      expect(style.isValid()).toBe(true);
    });
    it('should be true when chars is a function', function() {
      var style = new GrawlixStyle('style', {
        randomChars: function(len) {
          return 'whatever';
        }
      });
      expect(style.isValid()).toBe(true);
    });
    it('should be false when name not provided', function() {
      var style = new GrawlixStyle(null, { 
        randomChars: '!@#$'
      });
      expect(style.isValid()).toBe(false);
    });
    it('should be false when chars or fixed replacements not provided', () => {
      var style = new GrawlixStyle('style', {});
      expect(style.isValid()).toBe(false);
    });
  });

  describe('#canRandomize', function() {
    it('should be true when style has more than one character', function() {
      var style1 = new GrawlixStyle('style1', {
        randomChars: '!@#$'
      });
      var style2 = new GrawlixStyle('style2', {
        randomChars: '*'
      });
      expect(style1.canRandomize()).toBe(true);
      expect(style2.canRandomize()).toBe(false);
    });
    it("should be true when style's randomChars is set to a function", () => {
      var style = new GrawlixStyle('style', {
        randomChars: function() {}
      });
      expect(style.canRandomize()).toBe(true);
    });
  });

  describe('#getRandomGrawlix', function() {
    it('should return a randomly generated grawlix of the given length', () => {
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%^&*'
      });
      var grawlix = style.getRandomGrawlix(6);
      expect(grawlix.length).toEqual(6);
    });
    it("should never include characters outside of a style's set chars", ()=>{
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%^&*'
      });
      var nonStyleChars = /[^\!\@\#\$\%\^\&\*]/gi;
      var a = style.getRandomGrawlix(4);
      var b = style.getRandomGrawlix(10);
      var c = style.getRandomGrawlix(32);
      expect(_.isString(a)).toBe(true);
      expect(a.length).toEqual(4);
      expect(a).not.toMatch(nonStyleChars);
      expect(_.isString(b)).toBe(true);
      expect(b.length).toEqual(10);
      expect(b).not.toMatch(nonStyleChars);
      expect(_.isString(c)).toBe(true);
      expect(c.length).toEqual(32);
      expect(c).not.toMatch(nonStyleChars);
    });
    it('should run a randomChars function', function() {
      var isRun = false;
      var style = new GrawlixStyle('style', {
        randomChars: function() {
          isRun = true;
          return '!@#$%^*';
        }
      });
      var r = style.getRandomGrawlix(6);
      expect(isRun).toBe(true);
      expect(r).toEqual('!@#$%^*');
    });
    it('should throw an error if style does not support random mode', ()=>{
      var style = new GrawlixStyle('style', { char: 'x' });
      var r;
      var testFunc = function() {
        r = style.getRandomGrawlix(6);
      };
      expect(testFunc).toThrow();
      expect(r).not.toBeDefined();
    });
    it('should never repeat the same character twice in a row', function() {
      var numTrials = 10000;
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%★☒☎☠☢☣☹♡♢♤♧'
      });
      var dbls = _.map(style.chars.split(''), function(char) {
        return char + char;
      });
      for (var i=0; i<numTrials; i++) {
        var r = style.getRandomGrawlix(16);
        for (var n=0; n<dbls.length; n++) {
          expect(r).not.toContain(dbls[n]);
        }
      }
    });
    it('should never output a grawlix that ends on a !', function() {
      var numTrials = 10000;
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%'
      });
      for (var i=0; i<numTrials; i++) {
        var r = style.getRandomGrawlix(16);
        expect(r.charAt(15)).not.toEqual('!');
      }
    });
  });

  describe('#getFillGrawlix', function() {
    it('should return a string of the requested length', function() {
      var style = new GrawlixStyle('style', { char: '*' });
      var r = style.getFillGrawlix(16);
      expect(_.isString(r)).toBe(true);
      expect(r).toEqual('****************');
    });
    it('should default to the first char if chars longer than 1', () => {
      var style = new GrawlixStyle('style', {
        randomChars: '*!'
      });
      var r = style.getFillGrawlix(16);
      expect(r).toEqual('****************');
    });
    it('should work on unicode', function() {
      var style = new GrawlixStyle('style', { char: '☠' });
      var r = style.getFillGrawlix(16);
      expect(r).toEqual('☠☠☠☠☠☠☠☠☠☠☠☠☠☠☠☠');
    });
  });

  describe('#hasFixed', function() {
    it('should return true when fixed replacement for given word exists', ()=>{
      var style = new GrawlixStyle('style', {
        fixed: {
          word: '****'
        }
      });
      expect(style.hasFixed('word')).toBe(true);
    });
  });

  describe('#getFixed', function() {
    it('should return fixed replacement for given word', function() {
      var style = new GrawlixStyle('style', {
        fixed: {
          word: '****'
        }
      });
      expect(style.getFixed('word')).toEqual('****');
    });
  });

  describe('#addChars', function() {
    it('should add given characters to the style', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%'
      });
      var r = style.addChars('^&*');
      expect(r).toEqual(3);
      expect(style.chars).toContain('^');
      expect(style.chars).toContain('&');
      expect(style.chars).toContain('*');
    });
    it('should also accept an Array of chars', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%'
      });
      var r = style.addChars(['^', '&', '*']);
      expect(r).toEqual(3);
      expect(style.chars).toContain('^');
      expect(style.chars).toContain('&');
      expect(style.chars).toContain('*');
    });
    it('should not add characters already in the style', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%'
      });
      var r = style.addChars('%');
      expect(r).toEqual(0);
      expect(style.chars).not.toContain('%%');
    });
  });

  describe('#removeChars', function() {
    it('should remove given characters from the style', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡'
      });
      var r = style.removeChars('♡♢♧⚡');
      expect(r).toEqual(4);
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).not.toContain('⚡');
    });
    it('should also accept an Array', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡'
      });
      var r = style.removeChars(['♡','♢','♧','⚡']);
      expect(r).toEqual(4);
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).not.toContain('⚡');
    });
  });

  describe('#replaceChars', function() {
    it('should replace the given characters', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡'
      });
      var r = style.replaceChars({
        '♡': '♥',
        '♢': '♦',
        '♤': '♠',
        '♧': '♣'
      });
      expect(r).toEqual(4);
      expect(style.chars).not.toContain('♡');
      expect(style.chars).toContain('♥');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).toContain('♦');
      expect(style.chars).not.toContain('♤');
      expect(style.chars).toContain('♠');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).toContain('♣');
    });
    it('should ignore any characters not in the style', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚡'
      });
      var r = style.replaceChars({
        '♡': '♥',
        '♢': '♦',
        '♤': '♠',
        '♧': '♣',
        '⚑': 'f'
      });
      expect(r).toEqual(4);
      expect(style.chars).toContain('♥');
      expect(style.chars).toContain('♦');
      expect(style.chars).toContain('♠');
      expect(style.chars).toContain('♣');
      expect(style.chars).not.toContain('f');
    });
  });

  describe('#configure', function() {
    it('should support the char parameter', function() {
      var style = new GrawlixStyle('hearts');
      style.configure({
        char: '♥'
      });
      expect(style.chars).toEqual('♥');
    });
    it('should support the randomChars (string) parameter', function() {
      var style = new GrawlixStyle('style');
      style.configure({
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚡'
      });
      expect(style.chars).toEqual('★☒☎☠☢☣☹♡♢♤♧⚓⚔⚡');
    });
    it('should support the randomChars (function) parameter', function() {
      var style = new GrawlixStyle('style');
      var func = function() {
        return null;
      };
      style.configure({
        randomChars: func
      });
      expect(style.chars).toBe(func);
      expect(style.isValid()).toBe(true);
    });
    it('should support the randomChars.add parameter', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '!@#$%'
      });
      style.configure({
        randomChars: {
          add: '%^&*'
        }
      });
      expect(style.chars).toEqual('!@#$%^&*');
    });
    it('should support the randomChars.remove parameter', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡'
      });
      style.configure({
        randomChars: {
          remove: '♡♢♤♧'
        }
      });
      expect(style.chars).toEqual('★☒☎☠☢☣☹⚓⚔⚑⚡');
    });
    it('should support the randomChars.replace parameter', function() {
      var style = new GrawlixStyle('style', {
        randomChars: '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡'
      });
      style.configure({
        randomChars: {
          replace: {
            '♡': '♥',
            '♢': '♦',
            '♤': '♠',
            '♧': '♣'
          }
        }
      });
      expect(style.chars).toEqual('★☒☎☠☢☣☹♥♦♠♣⚓⚔⚑⚡');
    });
    describe('fixed parameter', function() {
      it('should add new values to the map', function() {
        var style = new GrawlixStyle('style', {
          fixed: {
            word1: 'w0rd1',
            word2: 'w0rd2'
          }
        });
        style.configure({
          fixed: {
            word1: 'wordOne',
            word3: 'w0rd3'
          }
        });
        expect(style.fixed.word1).toEqual('wordOne');
        expect(style.fixed.word2).toEqual('w0rd2');
        expect(style.fixed.word3).toEqual('w0rd3');
      });
      it('should remove words when set to false or null', function() {
        var style = new GrawlixStyle('style', {
          fixed: {
            word1: 'w0rd1',
            word2: 'w0rd2',
            word3: 'w0rd3'
          }
        });
        style.configure({
          fixed: {
            word2: false,
            word3: null
          }
        });
        expect(_.has(style.fixed, 'word2')).toBe(false);
        expect(_.has(style.fixed, 'word3')).toBe(false);
        expect(style.fixed.word1).toBe('w0rd1');
      });
    });
    it('should support the allowOverride parameter', function() {
      var style = new GrawlixStyle('style');
      style.configure({
        allowOverride: false
      });
      expect(style.isOverrideAllowed).toBe(false);
    });
  });

  describe('#clone', function() {
    it('should return an exact duplicate of the style', function() {
      var style = new GrawlixStyle('style', {
        randomChars: 'somechars',
        fixed: {
          word1: 'w0rd1',
          word2: 'w0rd2',
          word3: 'w0rd3'
        },
        allowOverride: false
      });
      var clone = style.clone();
      expect(clone.name).toEqual('style');
      expect(clone.chars).toEqual('somechars');
      expect(clone.fixed.word1).toEqual('w0rd1');
      expect(clone.fixed.word2).toEqual('w0rd2');
      expect(clone.fixed.word3).toEqual('w0rd3');
      expect(clone.isOverrideAllowed).toBe(false);
      // fixed map should be a clone, not the same object
      expect(clone.fixed).not.toBe(style.fixed);
    });
  });
});

/**
 * toGrawlixStyle factory function tests
 */
describe('toGrawlixStyle', function() {

  it('should produce a GrawlixStyle from a style object', function() {
    var style = toGrawlixStyle({
      name: 'style',
      char: 'x'
    });
    expect(style instanceof GrawlixStyle).toBe(true);
    expect(style.isValid()).toBe(true);
    expect(style.name).toEqual('style');
    expect(style.chars).toEqual('x');
  });

  it('should throw when name parameter is not provided', function() {
    var testFunc = function() {
      var result = toGrawlixStyle({
        char: 'x'
      });
    };
    expect(testFunc).toThrow();
  });

  it('should throw when char, randomChars or fixed parameter not provided',()=>{
    var testFunc = function() {
      var style = toGrawlixStyle({
        name: 'style'
      });
    };
    expect(testFunc).toThrow();
  });

});

/**
 * GrawlixStyleError tests
 */
describe('GrawlixStyleError', function() {
  it('should include given style name', function() {
    var err = new GrawlixStyleError({
      msg: 'style error',
      styleName: 'my-style'
    });
    expect(err.message).toEqual(
      'grawlix style error: style error\n' +
      'style: my-style'
    );
  });
  it('should include the name of a given plugin object', function() {
    var err = new GrawlixStyleError({
      msg: 'style error',
      plugin: {
        name: 'Plugin With Style'
      }
    });
    expect(err.message).toEqual(
      'grawlix style error: style error\n' +
      'plugin: Plugin With Style'
    );
  });
  it('should include a given plugin name', function() {
    var err = new GrawlixStyleError({
      msg: 'style error',
      plugin: 'Plugin With Style'
    });
    expect(err.message).toEqual(
      'grawlix style error: style error\n' +
      'plugin: Plugin With Style'
    );
  });
});
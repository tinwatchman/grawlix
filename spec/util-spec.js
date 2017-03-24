'use strict';

const _ = require('underscore');
const util = require('../util');
const GrawlixStyle = require('../styles').GrawlixStyle;

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

});
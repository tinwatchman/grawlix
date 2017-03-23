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

  describe('#addStyleOptionChars', function() {
    // setup
    var style;
    beforeEach(function() {
      style = new GrawlixStyle('style', '!@#$%', {});
    });

    it('should add given characters to the style', function() {
      util.addStyleOptionChars(style, '^&*');
      expect(style.chars).toContain('^');
      expect(style.chars).toContain('&');
      expect(style.chars).toContain('*');
    });

    it('should also accept an Array of chars as 2nd argument', function() {
      util.addStyleOptionChars(style, ['^', '&', '*']);
      expect(style.chars).toContain('^');
      expect(style.chars).toContain('&');
      expect(style.chars).toContain('*');
    });

    it('should not add characters already in the style', function() {
      util.addStyleOptionChars(style, '%');
      expect(style.chars).not.toContain('%%');
    });
  });

  describe('#removeStyleOptionChars', function() {
    // setup
    var style;
    beforeEach(function() {
      style = new GrawlixStyle('style', '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡', {});
    });

    it('should remove given characters from style', function() {
      util.removeStyleOptionChars(style, '♡♢♧⚡');
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).not.toContain('⚡');
    });

    it('should also accept an array of chars as 2nd argument', function() {
      util.removeStyleOptionChars(style, ['♡','♢','♧','⚡']);
      expect(style.chars).not.toContain('♡');
      expect(style.chars).not.toContain('♢');
      expect(style.chars).not.toContain('♧');
      expect(style.chars).not.toContain('⚡');
    });
  });

});
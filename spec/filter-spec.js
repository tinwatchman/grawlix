'use strict';

const _ = require('underscore');

const filters = require('../filters').filters;
const GrawlixFilter = require('../filters').GrawlixFilter;
const toGrawlixFilter = require('../filters').toGrawlixFilter;

describe('default filters', function() {

  // shorthand test filters function
  var testFilters = function(str) {
    return _.some(filters, function(filter) {
      return filter.isMatch(str);
    });
  };

  // basic tests
  describe('#basic tests', function() {
    it('should match ass', function() {
      expect(testFilters('ass')).toBe(true);
    });
    it('should match asshole', function() {
      expect(testFilters('asshole')).toBe(true);
    });
    it('should match bastard', function() {
      expect(testFilters('bastard')).toBe(true);
    });
    it('should match bitch', function() {
      expect(testFilters('bitch')).toBe(true);
    });
    it('should match cocksucker', function() {
      expect(testFilters('cocksucker')).toBe(true);
    });
    it('should match cunt', function() {
      expect(testFilters('cunt')).toBe(true);
    });
    it('should match fuck', function() {
      expect(testFilters('fuck')).toBe(true);
    });
    it('should match motherfucker', function() {
      expect(testFilters('motherfucker')).toBe(true);
    });
    it('should match piss', function() {
      expect(testFilters('piss')).toBe(true);
    });
    it('should match tits', function() {
      expect(testFilters('tits')).toBe(true);
    });
    it('should match titties', function() {
      expect(testFilters('titties')).toBe(true);
    });
    it('should match titty', function() {
      expect(testFilters('titty')).toBe(true);
    });
    it('should match masshole', function() {
      expect(testFilters('masshole')).toBe(true);
    });
    it('should match t1t$', function() {
      expect(testFilters('T1T$')).toBe(true);
    });
    it('should match $h1t', function() {
      expect(testFilters('$h1t')).toBe(true);
    });
    it('should match b1tch', function() {
      expect(testFilters('b1tch')).toBe(true);
    });
  });

  // check compound words and variants
  describe('#compound words', function() {
    it('should match badass', function() {
        expect(testFilters('badass')).toBe(true);
    });
    it('should match bitched', function() {
      expect(testFilters('bitched')).toBe(true);
    });
    it('should match bitchy', function() {
      expect(testFilters('bitchy')).toBe(true);
    });
    it('should match bullshit', function() {
      expect(testFilters('bullshit')).toBe(true);
    });
    it('should match dumbass', function() {
      expect(testFilters('DUMBASS')).toBe(true);
    });
    it('should match dumbasses', function() {
      expect(testFilters('dumbasses')).toBe(true);
    });
    it('should match fuckdick', function() {
      expect(testFilters('fuckdick')).toBe(true);
    });
    it('should match fuckshits', function() {
      expect(testFilters('fuckshits')).toBe(true);
    });
    it('should match fucktits', function() {
      expect(testFilters('fucktits')).toBe(true);
    });
    it('should match jackass', function() {
      expect(testFilters('jackass')).toBe(true);
    });
    it('should match jackasses', function() {
      expect(testFilters('jackasses')).toBe(true);
    });
    it('should match superbitches', function() {
      expect(testFilters('superbitches')).toBe(true);
    });
    it('should match wiseass', function() {
      expect(testFilters('wiseass')).toBe(true);
    });
  });
  
  // scunthorpe checks
  describe('#scunthorpes', function() {
    it('should not match scunthorpe', function() {
      expect(testFilters('scunthorpe')).toBe(false);
    });
    it('should not match shitake', function() {
      expect(testFilters('shitake')).toBe(false);
    });
    it('should not match shitakes', function() {
      expect(testFilters('shitakes')).toBe(false);
    });
    it('should not match bastardize', function() {
      expect(testFilters('bastardize')).toBe(false);
    });
    it('should not match bastardized', function() {
      expect(testFilters('bastardized')).toBe(false);
    });
    it('should not match bastardise', function() {
      expect(testFilters('bastardise')).toBe(false);
    });
    it('should not match assess', function() {
      expect(testFilters('assess')).toBe(false);
    });
    it('should not match bass', function() {
      expect(testFilters('bass')).toBe(false);
    });
    it('should not match brass', function() {
      expect(testFilters('brass')).toBe(false);
    });
    it('should not match bypass', function() {
      expect(testFilters('bypass')).toBe(false);
    });
    it('should not match bypasses', function() {
      expect(testFilters('bypasses')).toBe(false);
    });
    it('should not match carcass', function() {
      expect(testFilters('carcass')).toBe(false);
    });
    it ('should not match class', function() {
      expect(testFilters('class')).toBe(false);
    });
    it('should not match crass', function() {
      expect(testFilters('crass')).toBe(false);
    });
    it('should not match dickens', function() {
      expect(testFilters('Dickens')).toBe(false);
    });
    it('should not match dicker', function() {
      expect(testFilters('dicker')).toBe(false);
    });
    it('should not match dickie', function() {
      expect(testFilters('dickie')).toBe(false);
    });
    it('should not match embarrass', function() {
      expect(testFilters('embarrass')).toBe(false);
    });
    it('should not match gasses', function() {
      expect(testFilters('gasses')).toBe(false);
    });
    it('should not match glasses', function() {
      expect(testFilters('glasses')).toBe(false);
    });
    it('should not match kvass', function() {
      expect(testFilters('kvass')).toBe(false);
    });
    it('should not match lass', function() {
      expect(testFilters('lass')).toBe(false);
    });
    it('should not match mass', function() {
      expect(testFilters('mass')).toBe(false);
    });
    it('should not match masses', function() {
      expect(testFilters('masses')).toBe(false);
    });
    it('should not match morass', function() {
      expect(testFilters('morass')).toBe(false);
    });
    it('should not match passes', function() {
      expect(testFilters('passes')).toBe(false);
    });
    it('should not match sass', function() {
      expect(testFilters('sass')).toBe(false);
    });
    it('should not match quass', function() {
      expect(testFilters('quass')).toBe(false);
    });
    it('should not match underpasses', function() {
      expect(testFilters('underpasses')).toBe(false);
    });
    it('should not match titan', function() {
      expect(testFilters('titan')).toBe(false);
    });
    it('should not match tithe', function() {
      expect(testFilters('tithe')).toBe(false);
    });
    it('should not match titillate', function() {
      expect(testFilters('titillate')).toBe(false);
    });
    it('should not match title', function() {
      expect(testFilters('title')).toBe(false);
    });
    it('should not match titmouse', function() {
      expect(testFilters('titmouse')).toBe(false);
    });
    it('should not match titration', function() {
      expect(testFilters('titration')).toBe(false);
    });
    it('should not match titter', function() {
      expect(testFilters('titter')).toBe(false);
    });
    it('should not match titular', function() {
      expect(testFilters('titular')).toBe(false);
    });
  });

});

// GrawlixFilter factory function spec

describe('toGrawlixFilter', function() {
  it('should fail when not provided word parameter', function() {
    expect(function() {
      return toGrawlixFilter({ pattern: /fuck/i });
    }).toThrow();
  });
  it('should fail when not provided pattern parameter', function() {
    expect(function() {
      return toGrawlixFilter({ word: 'abadword' });
    }).toThrow();
  });
  it('should fail when pattern parameter not a RegExp', function() {
    expect(function() {
      return toGrawlixFilter({ word: 'abadword', pattern: 'abadword' });
    }).toThrow();
  });
  it('should return a GrawlixFilter object', function() {
    var r = toGrawlixFilter({
      word: 'abadword',
      pattern: /\babadword\b/i
    });
    expect(r instanceof GrawlixFilter).toBe(true);
  });
});
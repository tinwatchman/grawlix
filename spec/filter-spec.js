'use strict';

const _ = require('underscore');

const filters = require('../filters').filters;
const GrawlixFilter = require('../filters').GrawlixFilter;
const toGrawlixFilter = require('../filters').toGrawlixFilter;
const FilterTemplate = require('../filters').FilterTemplate;

// GrawfixFilter spec

describe('GrawfixFilter', function() {

  describe('#configure', function() {
    it('should configure the filter object as expected', function() {
      var filter = new GrawlixFilter('word', /word/i);
      filter.configure({
        priority: 1,
        template: '$1<%= word %>',
        expandable: true
      });
      expect(filter.priority).toEqual(1);
      expect(_.isFunction(filter.template)).toBe(true);
      expect(filter.isExpandable).toBe(true);
    });
  });

  describe('#isValid', function() {
    it('should return false when filter word is empty', function() {
      var filter = new GrawlixFilter('', /word/i);
      expect(filter.isValid()).toBe(false);
    });
    it('should return false when filter regex is not a RegExp', function() {
      var filter = new GrawlixFilter('', "/word/i");
      expect(filter.isValid()).toBe(false);
    });
  });

  describe('#isMatch', function() {
    it('should return true when a match is found', function() {
      var filter = new GrawlixFilter('word', /word/i);
      expect(filter.isMatch('here is my word yay')).toBe(true); 
    });
    it('should return false when no match is found', function() {
      var filter = new GrawlixFilter('asses', /(\b|[^glmp])[a@]sses\b/i);
      expect(filter.isMatch('you dumbass...')).toBe(false);
    });
  });

  describe('#getMatchLen', function() {
    it('should return the length of the matched word', function() {
      var filter = new GrawlixFilter('fuck', /f+u+c+k+/i);
      var testStr = 'fffuuuuuucccckkkkkkk';
      expect(filter.getMatchLen(testStr)).toEqual(testStr.length);
    });
    it('should deduct the length of any substrings', function() {
      var filter = new GrawlixFilter('asses', /(\b|[^glmp])[a@]sses\b/i);
      var testStr = 'YOU DUMBASSES!';
      expect(filter.getMatchLen(testStr)).toEqual(5);
    });
    it('should return the full length of the match', function() {
      var filter = new GrawlixFilter('dumbass', /\b(dumb)[a@]ss+/i);
      var testStr = 'dumb@ssssssss';
      expect(filter.getMatchLen(testStr)).toEqual(9);
    });
  });

  describe('#hasTemplate', function() {
    it('should return true when filter template has been set', function() {
      var filter = new GrawlixFilter('word', /word/i, {
        template: '$1<%= word %>'
      });
      expect(filter.hasTemplate()).toBe(true);
    });
  });

  describe('#template', function() {
    it('should be a function', function() {
      var filter = new GrawlixFilter('word', /word/i, {
        template: '$1<%= word %>'
      });
      expect(_.isFunction(filter.template)).toBe(true);
    });
    it('should take a single string as input', function() {
      var filter = new GrawlixFilter('word', /word/i, {
        template: '$1<%= word %>'
      });
      expect(filter.template('#####')).toEqual('$1#####');
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

// default filter tests

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
    it('should match t1tt1e$', function() {
      expect(testFilters('t1tt1e$')).toBe(true);
    });
    it('should match dumb@ss', function() {
      expect(testFilters('dumb@ss')).toBe(true);
    });
    it('should match dumb@sses', function() {
      expect(testFilters('dumb@sses')).toBe(true);
    });
  });

  // check compound words and variants
  describe('#compound matches', function() {
    it('should include badass', function() {
        expect(testFilters('badass')).toBe(true);
    });
    it('should include bitched', function() {
      expect(testFilters('bitched')).toBe(true);
    });
    it('should include bitchy', function() {
      expect(testFilters('bitchy')).toBe(true);
    });
    it('should include bullshit', function() {
      expect(testFilters('bullshit')).toBe(true);
    });
    it('should include dumbass', function() {
      expect(testFilters('DUMBASS')).toBe(true);
    });
    it('should include dumbasses', function() {
      expect(testFilters('dumbasses')).toBe(true);
    });
    it('should include fuckdick', function() {
      expect(testFilters('fuckdick')).toBe(true);
    });
    it('should include fuckshits', function() {
      expect(testFilters('fuckshits')).toBe(true);
    });
    it('should include fucktits', function() {
      expect(testFilters('fucktits')).toBe(true);
    });
    it('should include jackass', function() {
      expect(testFilters('jackass')).toBe(true);
    });
    it('should include jackasses', function() {
      expect(testFilters('jackasses')).toBe(true);
    });
    it('should include superbitches', function() {
      expect(testFilters('superbitches')).toBe(true);
    });
    it('should include wiseass', function() {
      expect(testFilters('wiseass')).toBe(true);
    });
    it('should include fuuuuuuck', function() {
      expect(testFilters('fuuuuuuck')).toBe(true);
    });
    it('should include fffuuuuuuckkkkkkk', function() {
      expect(testFilters('fffuuuuuuckkkkkkk')).toBe(true);
    });
    it('should include cuuuunnnnt', function() {
      expect(testFilters('cuuuunnnnt')).toBe(true);
    });
    it('should include ttiiiitttttttsss', function() {
      expect(testFilters('ttiiiitttttttsss')).toBe(true);
    });
    it('should include mutherfuckah', function() {
      expect(testFilters('mutherfuckah')).toBe(true);
    });
    it('should include diiiiiickkkk', function() {
      expect(testFilters('diiiiiickkkk')).toBe(true);
    });
    it('should match muthafucka', function() {
      expect(testFilters('muthafucka')).toBe(true);
    });
    it('should match dumb@ssssssss', function() {
      expect(testFilters('dumb@ssssssss')).toBe(true);
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
    it('should not match asset', function() {
      expect(testFilters('asset')).toBe(false);
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

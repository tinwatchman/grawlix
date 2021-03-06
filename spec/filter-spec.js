'use strict';

const _ = require('underscore');

const filters = require('../filters').filters;
const GrawlixFilter = require('../filters').GrawlixFilter;
const toGrawlixFilter = require('../filters').toGrawlixFilter;
const GrawlixFilterError = require('../filters').GrawlixFilterError;
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
    it('should support the minPriority option', function() {
      var filter1 = new GrawlixFilter('word', /word/i, {
        priority: 0
      });
      filter1.configure({
        minPriority: 2
      });
      var filter2 = new GrawlixFilter('word', /word/i, {
        priority: 3
      });
      filter2.configure({
        minPriority: 2
      });
      expect(filter1.priority).toEqual(2);
      expect(filter2.priority).toEqual(3);
    });
    it('should support the style option', function() {
      var filter = new GrawlixFilter('word', /word/i);
      filter.configure({
        style: 'redacted'
      });
      expect(filter.style).toEqual('redacted');
    });
  });

  describe('#isValid', function() {
    it('should return false when filter word is empty', function() {
      var filter = new GrawlixFilter('', /word/i);
      expect(filter.isValid()).toBe(false);
    });
    it('should return false when filter regex is not a RegExp', function() {
      var filter = new GrawlixFilter('word', "/word/i");
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
    it('should return 0 if there is no match', function() {
      var filter = new GrawlixFilter('fuck', /f+u+c+k+/i);
      var testStr = 'dumb@ssssssss';
      expect(filter.getMatchLen(testStr)).toEqual(0);
    });
  });

  describe('#hasStyle', function() {
    it('should return false if style not set', function() {
      var filter = new GrawlixFilter('word', /word/i);
      expect(filter.hasStyle()).toBe(false);
    });
    it('should return true if style is set', function() {
      var filter = new GrawlixFilter('word', /word/i, {
        style: 'asterix'
      });
      expect(filter.hasStyle()).toBe(true);
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

  describe('#clone', function() {
    it('should return an exact copy of the filter', function() {
      var filter1 = new GrawlixFilter('word', /word/i, {
        priority: 1,
        expandable: true,
        template: '$1<%= word %>',
        style: 'nextwave'
      });
      var filter2 = filter1.clone();
      expect(filter2.word).toEqual(filter1.word);
      expect(filter2.regex).toBe(filter1.regex);
      expect(filter2.priority).toEqual(filter1.priority);
      expect(filter2.template).toBe(filter1.template);
      expect(filter2.isExpandable).toEqual(filter1.isExpandable);
      expect(filter2.style).toEqual(filter1.style);
    });
  });

});

// GrawlixFilter factory function spec

describe('toGrawlixFilter', function() {

  it('should fail when not provided word parameter', function() {
    expect(function() {
      return toGrawlixFilter({ pattern: /fsck/i });
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

  // validation
  it('should all be valid', function() {
    _.each(filters, function(filter) {
      expect(filter instanceof GrawlixFilter).toBe(true);
      expect(filter.isValid()).toBe(true);
    });
  });

  // basic tests
  describe('(basic tests)', function() {
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
  describe('(compound matches)', function() {
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
    it('should match f u c k', function() {
      expect(testFilters('f u c k')).toBe(true);
    });
    it('should match s h i t', function() {
      expect(testFilters('s h i t')).toBe(true);
    });
    it('should match c u n t', function() {
      expect(testFilters('c u n t')).toBe(true);
    });
    it('should match t i t s', function() {
      expect(testFilters('t i t s')).toBe(true);
    });
    it('should match a s s', function() {
      expect(testFilters('a s s')).toBe(true);
    });
    it('should match b i t c h', function() {
      expect(testFilters('b i t c h')).toBe(true);
    });
    it('should match f_u_c_k', function() {
      expect(testFilters('f_u_c_k')).toBe(true);
    });
    it('should match f-u-c-k', function() {
      expect(testFilters('f-u-c-k')).toBe(true);
    });
    it('should match f*u*c*k', function() {
      expect(testFilters('f*u*c*k')).toBe(true);
    });
    it('should match f:u:c:k', function() {
      expect(testFilters('f:u:c:k')).toBe(true);
    });
    it('should match f>u>c>k', function() {
      expect(testFilters('f>u>c>k')).toBe(true);
    });
    it('should match f\\u\\c\\k', function() {
      expect(testFilters('f\\u\\c\\k')).toBe(true);
    });
    it('should match f/u/c/k', function() {
      expect(testFilters('f/u/c/k')).toBe(true);
    });
    it('should match f+U+0075+ck', function() {
      expect(testFilters('f+U+0075+ck')).toBe(true);
    });
    it('should match s0123h456i789t', function() {
      expect(testFilters('s0123h456i789t')).toBe(true);
    });
    it('should match f\nu\nc\nk', function() {
      expect(testFilters('f\nu\nc\nk')).toBe(true);
    });
    it('should match #cunt', function() {
      expect(testFilters('#cunt')).toBe(true);
    });
    it('should match .tits', function() {
      expect(testFilters('.tits')).toBe(true);
    });
    it('should match .t.i.t.s.', function() {
      expect(testFilters('.t.i.t.s.')).toBe(true);
    });
    it('should match >tits', function() {
      expect(testFilters('>tits')).toBe(true);
    });
    it('should match @$$h0le', function() {
      expect(testFilters('@$$h0le')).toBe(true);
    });
    it('should match @$$h0l3$', function() {
      expect(testFilters('@$$h0l3$')).toBe(true);
    });
    it('should match @$$', function() {
      expect(testFilters('@$$')).toBe(true);
    });
    it('should match @$$3$', function() {
      expect(testFilters('@$$3$')).toBe(true);
    });
    it('should match a0123s456s', function() {
      expect(testFilters('a0123s456s')).toBe(true);
    });
    it('should match dumb@$$', function() {
      expect(testFilters('dumb@$$')).toBe(true);
    });
  });
  
  // scunthorpe checks
  describe('(scunthorpes)', function() {
    it('should pass scunthorpe', function() {
      expect(testFilters('scunthorpe')).toBe(false);
    });
    it('should pass shitake', function() {
      expect(testFilters('shitake')).toBe(false);
    });
    it('should pass shitakes', function() {
      expect(testFilters('shitakes')).toBe(false);
    });
    it('should pass bastardize', function() {
      expect(testFilters('bastardize')).toBe(false);
    });
    it('should pass bastardized', function() {
      expect(testFilters('bastardized')).toBe(false);
    });
    it('should pass bastardise', function() {
      expect(testFilters('bastardise')).toBe(false);
    });
    it('should pass assess', function() {
      expect(testFilters('assess')).toBe(false);
    });
    it('should pass asset', function() {
      expect(testFilters('asset')).toBe(false);
    });
    it('should pass bass', function() {
      expect(testFilters('bass')).toBe(false);
    });
    it('should pass brass', function() {
      expect(testFilters('brass')).toBe(false);
    });
    it('should pass bypass', function() {
      expect(testFilters('bypass')).toBe(false);
    });
    it('should pass bypasses', function() {
      expect(testFilters('bypasses')).toBe(false);
    });
    it('should pass carcass', function() {
      expect(testFilters('carcass')).toBe(false);
    });
    it ('should pass class', function() {
      expect(testFilters('class')).toBe(false);
    });
    it('should pass crass', function() {
      expect(testFilters('crass')).toBe(false);
    });
    it('should pass dickens', function() {
      expect(testFilters('Dickens')).toBe(false);
    });
    it('should pass dicker', function() {
      expect(testFilters('dicker')).toBe(false);
    });
    it('should pass dickie', function() {
      expect(testFilters('dickie')).toBe(false);
    });
    it('should pass embarrass', function() {
      expect(testFilters('embarrass')).toBe(false);
    });
    it('should pass gasses', function() {
      expect(testFilters('gasses')).toBe(false);
    });
    it('should pass glasses', function() {
      expect(testFilters('glasses')).toBe(false);
    });
    it('should pass kvass', function() {
      expect(testFilters('kvass')).toBe(false);
    });
    it('should pass lass', function() {
      expect(testFilters('lass')).toBe(false);
    });
    it('should pass mass', function() {
      expect(testFilters('mass')).toBe(false);
    });
    it('should pass masses', function() {
      expect(testFilters('masses')).toBe(false);
    });
    it('should pass morass', function() {
      expect(testFilters('morass')).toBe(false);
    });
    it('should pass passes', function() {
      expect(testFilters('passes')).toBe(false);
    });
    it('should pass sass', function() {
      expect(testFilters('sass')).toBe(false);
    });
    it('should pass quass', function() {
      expect(testFilters('quass')).toBe(false);
    });
    it('should pass underpasses', function() {
      expect(testFilters('underpasses')).toBe(false);
    });
    it('should pass titan', function() {
      expect(testFilters('titan')).toBe(false);
    });
    it('should pass tithe', function() {
      expect(testFilters('tithe')).toBe(false);
    });
    it('should pass titillate', function() {
      expect(testFilters('titillate')).toBe(false);
    });
    it('should pass title', function() {
      expect(testFilters('title')).toBe(false);
    });
    it('should pass titmouse', function() {
      expect(testFilters('titmouse')).toBe(false);
    });
    it('should pass titration', function() {
      expect(testFilters('titration')).toBe(false);
    });
    it('should pass titter', function() {
      expect(testFilters('titter')).toBe(false);
    });
    it('should pass titular', function() {
      expect(testFilters('titular')).toBe(false);
    });
    it('should pass address@sssysadmin.com', function() {
      expect(testFilters('address@ssysadmin.com')).toBe(false);
    });
    it('should pass frak', function() {
      expect(testFilters('frak')).toBe(false);
    });
    it('should pass frell', function() {
      expect(testFilters('frell')).toBe(false);
    });
    it('should pass smeghead', function() {
      expect(testFilters('smeghead')).toBe(false);
    });
  });

});

// GrawlixFilterError tests

describe('GrawlixFilterError', function() {

  it('should support just taking a raw message as argument', function() {
    var err = new GrawlixFilterError('some-filter-error');
    expect(err.message).toEqual('some-filter-error');
    expect(err.filter).toBe(null);
    expect(err.plugin).toBe(null);
  });

  it('should support the msg argument', function() {
    var err = new GrawlixFilterError({
      msg: 'some-filter-error'
    });
    expect(err.message).toEqual('some-filter-error');
  });

  it('should support the message argument', function() {
    var err = new GrawlixFilterError({
      message: 'some-filter-error'
    });
    expect(err.message).toEqual('some-filter-error');
  });

  it('should support the filter argument', function() {
    var filterObj = {
      word: 'some-word',
      pattern: /some_pattern/i
    };
    var err = new GrawlixFilterError({
      msg: 'some-filter-error',
      filter: filterObj
    });
    expect(err.filter).toBe(filterObj);
  });

  it('should set filter to null if not provided', function() {
    var err = new GrawlixFilterError({
      msg: 'some-filter-error'
    });
    expect(err.filter).toBe(null);
    expect(err.plugin).toBe(null);
  });

  it('should support the plugin argument', function() {
    var pluginObj = {
      name: 'some-plugin'
    };
    var err = new GrawlixFilterError({
      msg: 'some-filter-error',
      plugin: pluginObj
    });
    expect(err.plugin).toBe(pluginObj);
  });

  it('should support the trace argument', function() {
    var trace = new Error();
    var err = new GrawlixFilterError({
      msg: 'some-filter-error',
      trace: trace
    });
    expect(err.stack).toBe(trace.stack);
  });

  it('should ignore trace argument if not an Error', function() {
    var trace = { stack: 'some-stack' };
    var err = new GrawlixFilterError({
      msg: 'some-error',
      trace: trace
    });
    expect(err.stack).not.toBe(trace.stack);
  });
  
});

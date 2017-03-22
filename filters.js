'use strict';

const _ = require('underscore');

/**
 * Placement enum
 * @type {Object}
 * 
 * Depending on the regular expression, a grawlix may need to take into account 
 * one or more parenthetical substrings. These substrings represent characters 
 * or content that -- while swept up into the regex -- is not obscene.
 */
const Placement = {
  PRE: 'pre', // parenthetical before the word
  POST: 'post', // parenthetical after the word
  BOTH: 'both' // parentheticals before and after the word
};

/**
 * GrawlixFilter class
 * @param {String} word  Word
 * @param {RegExp} regex Regular expression to find word
 * @param {Object} opts  Other options
 */
var GrawlixFilter = function(word, regex, opts) {
  this.word = word;
  this.regex = regex;
  if (_.isUndefined(opts)) { opts = {}; }
  this.priority = _.has(opts, 'priority') ? opts.priority : 0;
  this.placement = _.has(opts, 'placement') ? opts.placement : null;

  this.isMatch = function(str) {
    return (str.search(this.regex) > -1);
  };
  this.hasPlacement = function() {
    return (this.placement !== null);
  };
  this.getReplaceTemplate = function(grawlix) {
    switch (this.placement) {
      case Placement.PRE:
        return '$1' + grawlix;
      case Placement.POST:
        return grawlix + '$1';
      case Placement.BOTH:
        return '$1' + grawlix + '$2';
    }
    return null;
  };
};
GrawlixFilter.prototype = {};

/**
 * GrawlixFilter factory function
 * @param  {Object} obj          Filter settings
 * @param  {String} obj.word     Word filter is intended to replace. Required.
 * @param  {RegExp} obj.pattern  Regular expression to be used to find/match the 
 *                               word. Required.
 * @param  {Number} obj.priority Order in which filter should be run. The lower 
 *                               the priority, the faster the filter is applied. 
 *                               Defaults to 0.
 * @return {GrawlixFilter}       GrawlixFilter object
 */
var toGrawlixFilter = function(obj) {
  if (!_.has(obj, 'word') || !_.isString(obj.word)) {
    throw new Error('grawlix filter error: word parameter is required!');
  } else if (!_.has(obj, 'pattern') || !_.isRegExp(obj.pattern)) {
    throw new Error('grawlix filter error: pattern parameter is required!');
  }
  return new GrawlixFilter(
    obj.word,
    obj.pattern,
    obj
  );
};

/**
 * Default filters
 * @type {Array}
 */
var Filters = [
  new GrawlixFilter('motherfuck', /motherfuck/i),
  new GrawlixFilter('fuck', /fuck/i, { priority: 1 }),
  new GrawlixFilter('shit', /(?:[s$])h(?:[i1])t(?!ake)/i),
  new GrawlixFilter('dick', /d(?:[i1])ck(?!e|i)/i),
  new GrawlixFilter('piss', /p(?:[i1])ss(?!ant)/i),
  new GrawlixFilter('cunt', /(\b|[^s])cunt/i, { placement: Placement.PRE }),
  new GrawlixFilter('cocksuck', /c(?:[o0])cksuck/i),
  new GrawlixFilter('bastard', /\bbastard(?!ise|ize)/i),
  new GrawlixFilter('bitch', /b(?:[i1])tch/i),
  new GrawlixFilter('assholes', /assh(?:[o0])les/i),
  new GrawlixFilter('asshole', /assh(?:[o0])le/i, { priority: 1 }),
  new GrawlixFilter('asses', /([^glmp])asses\b/i, {
    priority: 0, 
    placement: Placement.PRE
  }),
  new GrawlixFilter('dumbass', /\b(dumb)ass/i, {
    priority: 1, 
    placement: Placement.PRE
  }),
  new GrawlixFilter('ass', /(\b|\s|[^bcglmprstvu])ass\b/i, {
    priority: 2, 
    placement: Placement.PRE
  }),
  new GrawlixFilter('tittie', /\bt(?:[i1])tt(?:[i1])e/i),
  new GrawlixFilter('titty', /\bt(?:[i1])tty/i),
  new GrawlixFilter('tits', /\bt(?:[i1])t(?:[s\$])/i),
  new GrawlixFilter('tit', /\bt(?:[i1])t([^ahilmrtu])/i, { 
    priority: 1, 
    placement: Placement.POST
  })
];

var FilterSort = function(a, b) {
  if (a.priority === b.priority) {
    return 0;
  }
  return (a.priority < b.priority) ? -1 : 1;
};

module.exports = {
  Placement: Placement,
  GrawlixFilter: GrawlixFilter,
  FilterSort: FilterSort,
  filters: Filters.sort(FilterSort),
  toGrawlixFilter: toGrawlixFilter
};
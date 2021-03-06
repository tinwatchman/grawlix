'use strict';

const _ = require('underscore');

/**
 * FilterTemplate enum
 * @type {Object}
 *
 * Depending on the regular expression, a grawlix filter may need to take into 
 * account one or more parenthetical substrings. These substrings represent 
 * characters or content that -- while not obscene in of themselves -- have been
 * swept up into the regex and should not be replaced. 
 * 
 * To avoid replacing non-obscene content, a filter template that takes 
 * parenthetical results into account can be run on the grawlix prior to 
 * replacing content. These take the form of standard 
 * [Underscore templates](http://underscorejs.org/#template). Three standard 
 * templates are provided below: `pre`, for when the word comes after the first
 * substring match; `post`, for when the word comes before the first substring;
 * and `between`, when the word is positioned between the first and second 
 * substring matches.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
 * @see http://underscorejs.org/#template
 */
const FilterTemplate = {
  PRE: '$1<%= word %>', // substring comes before word
  POST: '<%= word %>$1', // substring comes after word
  BETWEEN: '$1<%= word %>$2' // word between substrings
};

/**
 * GrawlixFilter class
 * @param {String}  word               Word
 * @param {RegExp}  regex              Regular expression to find word
 * @param {Object}  options            Filter options
 * @param {Number}  options.priority   Priority of filter. Lower numbers run 
 *                                     first. Default 0.
 * @param {String}  options.template   Template to use when using the filter to 
 *                                     replace the given word. Default null.
 * @param {Boolean} options.expandable Whether or not regex detects expanded 
 *                                     versions of words (e.g. 'fuuuuuck'). 
 *                                     Supporting themes can then fill in the 
 *                                     whole length of the matched word. Default
 *                                     false. 
 */
const GrawlixFilter = function(word, regex, options) {
  this.word = word;
  this.regex = regex;
  this.priority = 0;
  this.template = null;
  this.isExpandable = false;
  this.style = null;

  /**
   * Returns whether or not the filter is valid and ready to match content.
   * @return {Boolean}
   */
  this.isValid = function() {
    return (!_.isEmpty(this.word) && _.isRegExp(this.regex));
  };

  /**
   * Returns whether or not the filter has a match in the given string.
   * @param  {String}  str Content
   * @return {Boolean}     True if found, false otherwise
   */
  this.isMatch = function(str) {
    return (str.search(this.regex) > -1);
  };

  /**
   * Gets the filter match.
   * @param  {String} str Content
   * @return {Array}
   */
  this.getMatch = function(str) {
    return this.regex.exec(str);
  };

  /**
   * Gets length of word match.
   * @param  {String} str Content string
   * @return {Number}     Length of word match
   */
  this.getMatchLen = function(str) {
    var match = this.getMatch(str);
    if (match === null || match.length === 0) {
      return 0;
    }
    var len = match[0].length;
    // subtract length of parenthesized substring matches, if any
    if (match.length > 1) {
      for (var i=1; i<match.length; i++) {
        len -= match[i].length;
      }
    }
    return len;
  };

  /**
   * Returns whether or not this string has a template.
   * @return {Boolean}
   */
  this.hasTemplate = function() {
    return (this.template !== null && _.isFunction(this.template));
  };

  /**
   * Returns whether or not a specific style has been set on this filter.
   * @return {Boolean}
   */
  this.hasStyle = function() {
    return (this.style !== null);
  };

  /**
   * Configures filter based on given options.
   * @param  {Object} opts Options object. See above for available fields.
   */
  this.configure = function(opts) {
    if (_.isUndefined(opts)) { 
      return; 
    }
    if (_.has(opts, 'priority') && _.isNumber(opts.priority)) {
      this.priority = opts.priority;
    } else if (_.has(opts, 'minPriority') && _.isNumber(opts.minPriority) &&
      this.priority < opts.minPriority) {
      // set to minPriority if and only if priority is less than given min
      this.priority = opts.minPriority;
    }
    if (_.has(opts, 'template') && _.isString(opts.template)) {
      this.template = _.template(opts.template, { variable: 'word' });
    }
    if (_.has(opts, 'expandable') && _.isBoolean(opts.expandable)) {
      this.isExpandable = opts.expandable;
    }
    if (_.has(opts, 'style') && _.isString(opts.style)) {
      this.style = opts.style;
    }
  };

  /**
   * Returns a new GrawlixFilter instance that's an exact replica of this one.
   * @return {GrawlixFilter}
   */
  this.clone = function() {
    var filter = new GrawlixFilter(this.word, this.regex);
    filter.priority = this.priority;
    filter.template = this.template;
    filter.isExpandable = this.isExpandable;
    filter.style = this.style;
    return filter;
  };

  this.configure(options);
};
GrawlixFilter.prototype = {};

/**
 * Custom Error subclass for grawlix filter exceptions
 * @param {Object} args         Parameters
 * @param {String} args.msg     Error message. Required.
 * @param {String} args.message Alias for args.msg
 * @param {Object} args.filter  Filter object or GrawlixFilter instance
 * @param {Object} args.plugin  Source plugin. Optional.
 * @param {Error}  args.trace   New Error object to take stack trace from. 
 *                              Optional.
 */
const GrawlixFilterError = function(args) {
  this.name = 'GrawlixFilterError';
  this.filter = _.has(args, 'filter') ? args.filter : null;
  this.plugin = _.has(args, 'plugin') ? args.plugin : null;
  if (_.has(args, 'trace') && args.trace instanceof Error) {
    this.stack = args.trace.stack;
  } else {
    this.stack = (new Error()).stack;
  }
  // construct message
  if (_.has(args, 'msg')) {
    this.message = args.msg;
  } else if (_.has(args, 'message')) {
    this.message = args.message;
  } else {
    this.message = args;
  }
};
GrawlixFilterError.prototype = Object.create(Error.prototype);
GrawlixFilterError.prototype.constructor = GrawlixFilterError;

/**
 * GrawlixFilter factory function
 * @param  {Object}  obj            Filter settings
 * @param  {String}  obj.word       Word that the filter targets. Required. 
 * @param  {RegExp}  obj.pattern    Regular expression to be used to find/match 
 *                                  the word. Required.
 * @param  {Number}  obj.priority   See GrawfixFilter options.
 * @param  {String}  obj.template   See GrawfixFilter options.
 * @param  {Boolean} obj.expandable See GrawfixFilter options.
 * @param  {String}  obj.style      See GrawlixFilter options.
 * @return {GrawlixFilter}          GrawlixFilter object
 */
var toGrawlixFilter = function(obj) {
  if (!_.has(obj, 'word') || !_.isString(obj.word)) {
    throw new GrawlixFilterError({
      msg: 'word parameter is required',
      filter: obj
    });
  } else if (!_.has(obj, 'pattern') || !_.isRegExp(obj.pattern)) {
    throw new GrawlixFilterError({
      msg: 'pattern parameter is required',
      filter: obj
    });
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
  // 'fuck'-related filters
  new GrawlixFilter('motherfucker', /m[o0u]th(?:er|a)f+u+c+k+[e3]r/i, {
    expandable: true
  }), 
  new GrawlixFilter('motherfuck', /m[o0u]th(?:er|a)f+u+c+k+/i, {
    priority: 1,
    expandable: true
  }),
  new GrawlixFilter(
    'fuck', 
    /f+[\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}u+[\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}c+[\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}k+/i, 
    { 
      priority: 2,
      expandable: true
    }
  ),
  // 'shit' filter
  new GrawlixFilter(
    'shit', 
    /[s$]+[\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}h+[\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}[i1]+[\s023456789_\^\+\=\*\.\-,:"'>|\/\\]{0,42}t+(?!ake)/i, 
    {
      expandable: true
    }
  ),
  // 'cocksucker'-related filters
  new GrawlixFilter('cocksucker', /c+[o0]+c+k+s+u+c+k+[e3]+r+/i, {
    expandable: true
  }),
  new GrawlixFilter('cocksuck', /c+[o0]+c+k+s+u+c+k+/i, {
    priority: 1,
    expandable: true
  }),
  // 'ass'-related filters
  new GrawlixFilter('assholes', /[a@][s\$][s\$]h[o0]l[e3][s\$]/i),
  new GrawlixFilter('asshole', /[a@][s\$][s\$]h[o0]+l[e3]/i, { 
    priority: 1,
    expandable: true 
  }),
  new GrawlixFilter('asses', /(\b|^|[^glmp])[a@][s\$][s\$][e3][s\$](?:\b|$)/i, {
    template: FilterTemplate.PRE 
  }),
  new GrawlixFilter('dumbass', /\b(dumb)[a@][s\$][s\$]+/i, {
    priority: 1,
    expandable: true,
    template: FilterTemplate.PRE
  }),
  new GrawlixFilter(
    'ass',
    /(\b|^|\s|[^bcglmprstvu])[a@][\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}[s\$][\s\d_\^\+\=\*\.\-,:"'>|\/\\]{0,42}[s\$]+(?:\b|$)/i, 
    {
      priority: 2,
      template: FilterTemplate.PRE,
      expandable: true
    }
  ),
  // 'tit'-related filters
  new GrawlixFilter('titties', /\bt[i1]tt[i1]e[s\$]/i),
  new GrawlixFilter('tittie', /\bt[i1]tt[i1]e/i, {
    priority: 1
  }),
  new GrawlixFilter('titty', /\bt[i1]tty/i),
  new GrawlixFilter(
    'tits', 
    /\bt+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}[i1]+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}t+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}[s\$]+/i, 
    {
      priority: 1,
      expandable: true
    }
  ),
  new GrawlixFilter(
    'tit', 
    /\bt+[i1]+t([^ahilmrtu])/i, 
    {
      priority: 2,
      template: FilterTemplate.POST,
      expandable: true
    }
  ),
  // 'piss' filter
  new GrawlixFilter('piss', /p[i1]+ss+(?!ant)/i, {
    expandable: true
  }),
  // various insults
  new GrawlixFilter('dick', /d[i1]+c+k+(?!e|i)/i, {
    expandable: true
  }),
  new GrawlixFilter(
    'cunt', 
    /(\b|[^s])c+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}u+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}n+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}t/i, 
    { 
      template: FilterTemplate.PRE,
      expandable: true
    }
  ),
  new GrawlixFilter('bastard', /\bb[a@]+st[a@]+r+d(?!ise|ize)/i, {
    expandable: true
  }),
  new GrawlixFilter('bitch', 
    /b+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}[i1]+[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}t[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}c[\s_\^\+\=\*\.\-,:"'>|\/\\]{0,42}h/i, 
    {
      expandable: true
    }
  )
];

/**
 * FilterSort function. Sorts filters by priority, lowest first.
 * @param  {GrawlixFilter} a Filter object
 * @param  {GrawlixFilter} b Filter object
 * @return {Number}
 */
var FilterSort = function(a, b) {
  if (a.priority === b.priority) {
    return 0;
  }
  return (a.priority < b.priority) ? -1 : 1;
};

module.exports = {
  GrawlixFilter: GrawlixFilter,
  GrawlixFilterError: GrawlixFilterError,
  FilterSort: FilterSort,
  FilterTemplate: FilterTemplate,
  filters: Filters.sort(FilterSort),
  toGrawlixFilter: toGrawlixFilter
};
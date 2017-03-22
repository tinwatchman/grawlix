'use strict';

const _ = require('underscore');

/**
 * Map of recognized styles
 * @type {Object}
 */
const Style = {
    ASCII: 'ascii',
    ASTERIX: 'asterix',
    DINGBATS: 'dingbats',
    NEXTWAVE: 'nextwave',
    REDACTED: 'redacted',
    UNICODE: 'unicode',
    UNDERSCORE: 'underscore'
};

/**
 * Class representing a style
 * @param {String} name     Style name
 * @param {String} chars    Characters used by style (no separators)
 * @param {Object} replaces Map of fixed replacement strings
 */
const GrawlixStyle = function(name, chars, replaces) {
    this.name = name;
    this.chars = chars;
    this.replaces = replaces;

    /**
     * Returns whether or not this style supports random grawlix generation
     * @return {Boolean}
     */
    this.canRandomize = function() {
        return (this.chars.length > 1);
    };

    /**
     * Returns whether or not style has a fixed replacement for the given word
     * @param  {String}  word Word
     * @return {Boolean}      True if replacement found, false otherwise
     */
    this.hasFixed = function(word) {
        return (_.has(this.replaces, word) && !_.isEmpty(this.replaces[word]));
    };
};
GrawlixStyle.prototype = {};

/**
 * Default style configurations
 * @type {Array}
 */
const Styles = [
    // default style
    new GrawlixStyle(Style.ASCII, '@!#$%^&*', {
        fuck: '%!&#',
        shit: '$$#!%',
        dick: '%!&#',
        piss: '&!$$#',
        cunt: '#^&%',
        cocksuck: '#*#%$$!#%',
        ass: '$1@$$$$',
        asses: '$1@$$$$#$$',
        asshole: '@$$$$#%!&',
        dumbass: '$1@$$$$',
        bastard: '%@$$%@*#',
        bitch: '%!#*%',
        tit: '%!%$1',
        tits: '%!%$$',
        titty: '%!%%^',
        tittie: '%!%%!#'
    }),
    // single-character styles
    new GrawlixStyle(Style.ASTERIX, '*', {
        ass: '$1***',
        asses: '$1*****',
        dumbass: '$1***',
        tit: '***$1'
    }),
    new GrawlixStyle(Style.NEXTWAVE, '☠', {
        ass: '$1☠☠☠',
        asses: '$1☠☠☠☠☠',
        dumbass: '$1☠☠☠',
        tit: '☠☠☠$1'
    }),
    new GrawlixStyle(Style.REDACTED, '█', {
        ass: '$1███',
        asses: '$1█████',
        dumbass: '$1███',
        tit: '███$1'
    }),
    new GrawlixStyle(Style.UNDERSCORE, '_', {
        ass: '$1___',
        asses: '$1______',
        dumbass: '$1___',
        tit: '___$1'
    }),
    // dingbats (unicode-only) style
    new GrawlixStyle(Style.DINGBATS, '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡', {
        ass: '$1☹☠☠',
        asses: '$1☹☠☠♯☠',
        dumbass: '$1☹☠☠',
        tit: '⚓⚑⚓$1'
    }),
    // unicode style
    new GrawlixStyle(Style.UNICODE, '!@#$%★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡', {
        fuck: '⚑☠♧⚔',
        shit: '$$#!⚓',
        dick: '♢!♧⚔',
        piss: '☣!$$$$',
        cunt: '♧♡⚔⚓',
        cocksuck: '♧☹♧⚔$$♡♧⚔',
        ass: '$1@$$$$',
        asses: '$1@$$$$#$$',
        asshole: '@$$$$#☢!⚡',
        dumbass: '$1@$$$$',
        bastard: '☣@$$⚓@☢♢',
        bitch: '☣!⚓♧#',
        tit: '⚓!⚓$1',
        tits: '⚓!⚓$$',
        titty: '⚓!⚓⚓⚔',
        tittie: '⚓!⚓⚓!#'
    })
];

module.exports = {
    'styles': Styles,
    'Style': Style,
    'GrawlixStyle': GrawlixStyle
};

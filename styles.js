'use strict';

const _ = require('underscore');

/**
 * Map of recognized default styles
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

    /**
     * Gets a fixed replacement string from the map
     * @param  {String} word Word
     * @return {String}      Replacement string
     */
    this.getFixed = function(word) {
        return this.replaces[word];
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
        motherfuck: '%*^##*%!&#',
        motherfucker: '%*^##*%!&##&',
        shit: '$$#!%',
        dick: '%!&#',
        piss: '&!$$#',
        cunt: '#^&%',
        cocksuck: '#*#%$$!#%',
        cocksucker: '#*#%$$!#%#&',
        ass: '$1@$$$$',
        asses: '$1@$$$$#$$',
        asshole: '@$$$$#%!&',
        assholes: '@$$$$#%!&$$',
        dumbass: '$1@$$$$',
        bastard: '%@$$%@*#',
        bitch: '%!#*%',
        tit: '%!%$1',
        tits: '%!%$$',
        titty: '%!%%^',
        tittie: '%!%%!#',
        titties: '%!%%!#$'
    }),
    // dingbats (unicode-only) style
    new GrawlixStyle(Style.DINGBATS, '★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡♯✓☝', {
        fuck: '⚑☠♧⚔',
        motherfuck: '★☹⚓♯⚡☢⚑☠♧⚔',
        motherfucker: '★☹⚓♯⚡☢⚑☠♧⚔⚡☢',
        shit: '☠♯☝⚓',
        dick: '♢☝♧⚔',
        piss: '☣☝☠☠',
        cunt: '♧♡⚔⚓',
        cocksuck: '♧☹♧⚔☠♡♧⚔',
        cocksucker: '♧☹♧⚔☠♡♧⚔⚡☢',
        ass: '$1☹☠☠',
        asses: '$1☹☠☠♯☠',
        asshole: '☹☠☠♯☢✓⚡',
        assholes: '☹☠☠♯☢✓⚡☠',
        dumbass: '$1☹☠☠',
        bastard: '☣☹☠⚓@☢♢',
        bitch: '☣☝⚓♧♯',
        tit: '⚓☝⚓$1',
        tits: '⚓☝⚓☠',
        titty: '⚓☝⚓⚓⚔',
        tittie: '⚓☝⚓⚓☝♯',
        titties: '⚓☝⚓⚓☝♯☠'
    }),
    // unicode style
    new GrawlixStyle(Style.UNICODE, '!@#$%★☒☎☠☢☣☹♡♢♤♧⚓⚔⚑⚡', {
        fuck: '⚑☠♧⚔',
        motherfuck: '★☹⚓#⚡☢⚑☠♧⚔',
        motherfucker: '★☹⚓#⚡☢⚑☠♧⚔⚡☢',
        shit: '$$#!⚓',
        dick: '♢!♧⚔',
        piss: '☣!$$$$',
        cunt: '♧♡⚔⚓',
        cocksuck: '♧☹♧⚔$$♡♧⚔',
        cocksucker: '♧☹♧⚔$$♡♧⚔⚡☢',
        ass: '$1@$$$$',
        asses: '$1@$$$$#$$',
        asshole: '@$$$$#☢!⚡',
        assholes: '@$$$$#☢!⚡$$',
        dumbass: '$1@$$$$',
        bastard: '☣@$$⚓@☢♢',
        bitch: '☣!⚓♧#',
        tit: '⚓!⚓$1',
        tits: '⚓!⚓$$',
        titty: '⚓!⚓⚓⚔',
        tittie: '⚓!⚓⚓!#',
        titties: '⚓!⚓⚓!#$$'
    }),
    // single-character styles
    new GrawlixStyle(Style.ASTERIX, '*', {}),
    new GrawlixStyle(Style.NEXTWAVE, '☠', {}),
    new GrawlixStyle(Style.REDACTED, '█', {}),
    new GrawlixStyle(Style.UNDERSCORE, '_', {})
];

module.exports = {
    'styles': Styles,
    'Style': Style,
    'GrawlixStyle': GrawlixStyle
};

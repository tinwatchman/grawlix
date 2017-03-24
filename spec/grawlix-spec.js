'use strict';

const _ = require('underscore');

const grawlix = require('../grawlix');

describe('grawlix', function() {

  describe('#getDefaults', function() {
    it('should return the default options', function() {
      var defaults = grawlix.getDefaults();
      expect(_.isObject(defaults)).toBe(true);
      expect(_.has(defaults, 'style')).toBe(true);
    });
  });

  describe('#Style', function() {
    it('should exist', function() {
      expect(grawlix.Style).toBeDefined();
      expect(_.isObject(grawlix.Style)).toBe(true);
    });
  });

  describe('#GrawlixStyle', function() {
    it('should exist', function() {
      expect(grawlix.GrawlixStyle).toBeDefined();
      expect(_.isFunction(grawlix.GrawlixStyle)).toBe(true);
    });
  });

  describe('#FilterTemplate', function() {
    it('should exist', function() {
      expect(grawlix.FilterTemplate).toBeDefined();
      expect(_.isObject(grawlix.FilterTemplate)).toBe(true);
    });
  });

  describe('#basic tests', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'ascii',
        randomize: false 
      });
    });

    it('should replace curses with grawlixes', function() {
      var t1 = grawlix("fuck this shit I'm out");
      expect(t1).toEqual("%!&# this $#!% I'm out");
      var t2 = grawlix("you dumbasses don't know who you're messing with!");
      expect(t2).toEqual("you dumb@$$#$ don't know who you're messing with!");
      var t3 = grawlix("well, you PISSED ME OFF!");
      expect(t3).toEqual("well, you &!$$ED ME OFF!");
      var t4 = grawlix("man this shit is so tits");
      expect(t4).toEqual("man this $#!% is so %!%$");
      var t5 = grawlix("you guys are such assholes");
      expect(t5).toEqual("you guys are such @$$#%!&$");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("%!#*%es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you %!&#ing #*#%$!#%#&.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh!");
      expect(t8).toEqual("Give me the %!&#ing keys, you %!&#ing #*#%$!#%ing " +
        "%*^##*%!&##&, aaarrrghh!");
      var t9 = grawlix("PM ME YOUR T1TT1E$");
      expect(t9).toEqual("PM ME YOUR %!%%!#$");
      var t10 = grawlix("you dumb@ss...");
      expect(t10).toEqual("you dumb@$$...");
    });

    it('should work on multiline strings', function() {
      var str = "Can you motherfucking dumbfucks even comprehend what I am\n" +
        "all about in your tiny minds?\r\n\r\n" +
        "Fuck this shit I'm done with all of you.\nI'm just done.\n\n";
      var exp = "Can you %*^##*%!&#ing dumb%!&#s even comprehend what I am\n" +
        "all about in your tiny minds?\r\n\r\n" +
        "%!&# this $#!% I'm done with all of you.\nI'm just done.\n\n";
      expect(grawlix(str)).toEqual(exp);
    });

  });

  describe('#allowed functionality', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'ascii',
        randomize: false 
      });
    });

    it('should allow words to be whitelisted', function() {
      var str = 'his young ward Dick Grayson';
      var r = grawlix(str, {
        allowed: [ 'dick' ]
      });
      expect(r).toEqual(str);
    });

  });

  describe('#randomize option', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'unicode',
        randomize: true 
      });
    });

    it('should generate random grawlixes based on the theme', function() {
      var t1 = grawlix("fuck this shit I'm out");
      expect(t1).not.toContain('fuck');
      expect(t1).not.toContain('shit');
      expect(t1.length).toEqual(22);
    });

    it('should fill out expanded matches', function() {
      var t = "fuuuuuuuuuck me";
      var r = grawlix(t);
      expect(r).not.toContain('fuuuuuuuuuck');
      expect(r.length).toEqual(t.length);
    });
    
  });

  describe('#nextwave theme', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'nextwave',
        randomize: false
      });
    });

    it('should replace curses with skulls', function() {
      var t1 = grawlix("fuck this shit I'm out");
      expect(t1).toEqual("☠☠☠☠ this ☠☠☠☠ I'm out");
      var t2 = grawlix("you dumbasses don't know who you're messing with!");
      expect(t2).toEqual("you dumb☠☠☠☠☠ don't know who you're messing with!");
      var t3 = grawlix("well, you PISSED ME OFF!");
      expect(t3).toEqual("well, you ☠☠☠☠ED ME OFF!");
      var t4 = grawlix("man this shit is so tits");
      expect(t4).toEqual("man this ☠☠☠☠ is so ☠☠☠☠");
      var t5 = grawlix("you guys are such assholes");
      expect(t5).toEqual("you guys are such ☠☠☠☠☠☠☠☠");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("☠☠☠☠☠es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you ☠☠☠☠ing ☠☠☠☠☠☠☠☠☠☠.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh.");
      expect(t8).toEqual("Give me the ☠☠☠☠ing keys, you ☠☠☠☠ing ☠☠☠☠☠☠☠☠ing " +
        "☠☠☠☠☠☠☠☠☠☠☠☠, aaarrrghh.");
      var t9 = grawlix("PM ME YOUR T1TT1E$");
      expect(t9).toEqual("PM ME YOUR ☠☠☠☠☠☠☠");
      var t10 = grawlix("you dumb@ss...");
      expect(t10).toEqual("you dumb☠☠☠...");
    });
  });

  describe('#redacted theme', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'redacted',
        randomize: false
      });
    });

    it('should replace curses with blanks', function() {
      var t1 = grawlix("fuck this shit I'm out");
      expect(t1).toEqual("████ this ████ I'm out");
      var t2 = grawlix("you dumbasses don't know who you're messing with!");
      expect(t2).toEqual("you dumb█████ don't know who you're messing with!");
      var t3 = grawlix("well, you PISSED ME OFF!");
      expect(t3).toEqual("well, you ████ED ME OFF!");
      var t4 = grawlix("man this shit is so tits");
      expect(t4).toEqual("man this ████ is so ████");
      var t5 = grawlix("you guys are such assholes");
      expect(t5).toEqual("you guys are such ████████");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("█████es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you ████ing ██████████.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh.");
      expect(t8).toEqual("Give me the ████ing keys, you ████ing ████████ing " +
        "████████████, aaarrrghh.");
      var t9 = grawlix("PM ME YOUR T1TT1E$");
      expect(t9).toEqual("PM ME YOUR ███████");
      var t10 = grawlix("you dumb@ss...");
      expect(t10).toEqual("you dumb███...");
    });
  });

  describe('#asterix theme', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'asterix',
        randomize: false
      });
    });

    it('should replace curses with asterixes', function() {
      var t1 = grawlix("fuck this shit I'm out");
      expect(t1).toEqual("**** this **** I'm out");
      var t2 = grawlix("you dumbasses don't know who you're messing with!");
      expect(t2).toEqual("you dumb***** don't know who you're messing with!");
      var t3 = grawlix("well, you PISSED ME OFF!");
      expect(t3).toEqual("well, you ****ED ME OFF!");
      var t4 = grawlix("man this shit is so tits");
      expect(t4).toEqual("man this **** is so ****");
      var t5 = grawlix("you guys are such assholes");
      expect(t5).toEqual("you guys are such ********");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("*****es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you ****ing **********.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh.");
      expect(t8).toEqual("Give me the ****ing keys, you ****ing ********ing " +
        "************, aaarrrghh.");
      var t9 = grawlix("PM ME YOUR T1TT1E$");
      expect(t9).toEqual("PM ME YOUR *******");
      var t10 = grawlix("you dumb@ss...");
      expect(t10).toEqual("you dumb***...");
    });
  });

  describe('#underscore theme', function() {
    // setup
    beforeAll(function() {
      grawlix.setDefaults({
        style: 'underscore',
        randomize: false
      });
    });

    it('should replace curses with underscores', function() {
      var t1 = grawlix("fuck this shit I'm out");
      expect(t1).toEqual("____ this ____ I'm out");
      var t2 = grawlix("you dumbasses don't know who you're messing with!");
      expect(t2).toEqual("you dumb_____ don't know who you're messing with!");
      var t3 = grawlix("well, you PISSED ME OFF!");
      expect(t3).toEqual("well, you ____ED ME OFF!");
      var t4 = grawlix("man this shit is so tits");
      expect(t4).toEqual("man this ____ is so ____");
      var t5 = grawlix("you guys are such assholes");
      expect(t5).toEqual("you guys are such ________");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("_____es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you ____ing __________.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh.");
      expect(t8).toEqual("Give me the ____ing keys, you ____ing ________ing " +
        "____________, aaarrrghh.");
      var t9 = grawlix("PM ME YOUR T1TT1E$");
      expect(t9).toEqual("PM ME YOUR _______");
      var t10 = grawlix("you dumb@ss...");
      expect(t10).toEqual("you dumb___...");
    });
  });

});
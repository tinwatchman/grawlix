'use strict';

const _ = require('underscore');

const grawlix = require('../grawlix');

describe('grawlix', function() {

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
      expect(t3).toEqual("well, you &!$#ED ME OFF!");
      var t4 = grawlix("man this shit is so tits");
      expect(t4).toEqual("man this $#!% is so %!%$");
      var t5 = grawlix("you guys are such assholes");
      expect(t5).toEqual("you guys are such @$$#%!&s");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("%!#*%es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you %!&#ing #*#%$!#%er.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh.");
      expect(t8).toEqual("Give me the %!&#ing keys, you %!&#ing #*#%$!#%ing " +
        "%*^##*%!&#er, aaarrrghh.");
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
      expect(t5).toEqual("you guys are such ☠☠☠☠☠☠☠s");
      var t6 = grawlix("bitches say what?");
      expect(t6).toEqual("☠☠☠☠☠es say what?");
      var t7 = grawlix("Hand me the keys, you fucking cocksucker.");
      expect(t7).toEqual("Hand me the keys, you ☠☠☠☠ing ☠☠☠☠☠☠☠☠er.");
      var t8 = grawlix("Give me the fucking keys, you fucking cocksucking " + 
        "motherfucker, aaarrrghh.");
      expect(t8).toEqual("Give me the ☠☠☠☠ing keys, you ☠☠☠☠ing ☠☠☠☠☠☠☠☠ing " +
        "☠☠☠☠☠☠☠☠☠☠er, aaarrrghh.");
    });
  });
});
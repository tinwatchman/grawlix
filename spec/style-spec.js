'use strict';

var GrawlixStyle = require('../grawlix').GrawlixStyle;

describe('GrawlixStyle', function() {

	describe('#canRandomize', function() {
		it('should be true when style has more than one character', function() {
			var style1 = new GrawlixStyle('style1', '!@#$', {});
			var style2 = new GrawlixStyle('style2', '*', {});
			expect(style1.canRandomize()).toBe(true);
			expect(style2.canRandomize()).toBe(false);
		});
	});

	describe('#hasFixed', function() {
		it('should return true when fixed replacement for given word exists', ()=>{
      var style = new GrawlixStyle('style', '*', {
        word: '****'
      });
      expect(style.hasFixed('word')).toBe(true);
		});
	});

  describe('#getFixed', function() {
    it('should return fixed replacement for given word', function() {
      var style = new GrawlixStyle('style', '*', {
        word: '****'
      });
      expect(style.getFixed('word')).toEqual('****');
    });
  });
  
});
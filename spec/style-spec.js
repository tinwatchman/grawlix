'use strict';

var GrawlixStyle = require('../grawlix').GrawlixStyle;

describe('GrawlixStyle', function() {

  describe('#isValid', function() {
    it('should be true when both name and chars are set', function() {
      var style = new GrawlixStyle('style', '!@#$');
      expect(style.isValid()).toBe(true);
    });
    it('should be true when both name and at least one fixed replacement is ' + 
       ' set', function() {
      var style = new GrawlixStyle('style', null, {
        word: '#!$@'
      });
      expect(style.isValid()).toBe(true);
    });
    it('should be false when name not provided', function() {
      var style = new GrawlixStyle(null, '!@#$');
      expect(style.isValid()).toBe(false);
    });
    it('should be false when chars or fixed replacements not provided', () => {
      var style = new GrawlixStyle('style', null);
      expect(style.isValid()).toBe(false);
    });
  });

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
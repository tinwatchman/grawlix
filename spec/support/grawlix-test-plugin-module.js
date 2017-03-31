'use strict';

const GrawlixPlugin = require('../../grawlix').GrawlixPlugin;

module.exports = function(options) {
  return new GrawlixPlugin('grawlix-test-plugin-module');
};

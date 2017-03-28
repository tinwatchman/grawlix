'use strict';

const GrawlixPlugin = require('../../grawlix').GrawlixPlugin;

module.exports = function(options) {
  options.isGrawlixPluginFactoryRun = true;
  return new GrawlixPlugin({
    name: 'grawlix-test-plugin-module',
    init: function(options) {
      options.inits++;
    }
  });
};

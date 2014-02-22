/*jshint node: true*/
'use strict';

exports.version = '0.0.3';

var postcss = require('postcss');

var _process = function (css) {
  var queries = {};

  css.each(function (rule, i) {
    if (rule.type !== 'atrule' && rule.name !== 'media') {
      return true;
    }

    var query = rule._params;
    var past = queries[query];

    if (typeof past === 'object') {
      past.rules.reverse();
      past.each(function (r) {
        rule.prepend(r);
      });
      past.removeSelf();
    }

    queries[query] = rule;
  });

  return css;
};

var _pack = function (css, opts) {
  return postcss().use(this.processor).process(css, opts);
};

exports.processor = _process;
exports.pack = _pack;

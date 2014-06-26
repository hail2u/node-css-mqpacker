/* jshint node: true */
'use strict';

var postcss = require('postcss');

var _process = function (css) {
  var queries = {};
  var params = [];

  css.each(function (rule, i) {
    if (rule.type !== 'atrule' || rule.name !== 'media') {
      return true;
    }

    var query = rule.params;
    var past = queries[query];

    if (typeof past === 'object') {
      rule.each(function (r) {
        past.append(r);
      });
    } else {
      queries[query] = rule;
      params.push(query);
    }

    rule.removeSelf();
  });

  params.forEach(function (param) {
    css.append(queries[param]);
  });

  return css;
};

var _pack = function (css, opts) {
  return postcss().use(this.processor).process(css, opts);
};

exports.processor = _process;
exports.pack = _pack;

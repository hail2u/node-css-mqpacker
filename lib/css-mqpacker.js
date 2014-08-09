/* jshint node: true */
'use strict';

var postcss = require('postcss');

var _fuseStrings = function (a, b) {
  var i = 0;
  var s = '';
  var j = 0;

  for (i = b.length; i > 0; i--) {
    s = b.substring(0, i);
    j = a.lastIndexOf(s);

    if (j >= 0 && j + s.length === a.length) {
      break;
    }
  }

  return a + b.substring(i);
};

var _process = function (css) {
  var queries = {};
  var params = [];

  css.each(function (rule) {
    if (rule.type !== 'atrule' || rule.name !== 'media') {
      return true;
    }

    var query = rule.params;
    var past = queries[query];

    if (typeof past === 'object') {
      rule.first.before = _fuseStrings(_fuseStrings(past.after, rule.before), rule.first.before);
      rule.each(function (r) {
        past.append(r);
      });
      past.after = rule.after;
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

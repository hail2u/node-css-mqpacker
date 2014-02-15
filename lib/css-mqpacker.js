/*jshint node: true*/
'use strict';

exports.version = '0.0.0';

var postcss = require('postcss');

var _pack = function (css, filename) {
  var opts = {};

  if (typeof filename === 'string') {
    opts.from = filename;
  }

  var packer = postcss(function (css) {
    var queries = {};

    css.each(function (rule, i) {
      if (rule.type !== 'atrule' && rule.name !== 'media') {
        return true;
      }

      var query = rule._params;

      if (typeof queries[query] === 'number') {
        rule.each(function (rule) {
          css.rules[queries[query]].append(rule);
        });
        rule.parent.remove(i);
      } else {
        queries[query] = i;
      }
    });

    return css;
  });

  return packer.process(css, opts);
};

exports.pack = _pack;

/*jshint node: true*/
'use strict';

exports.version = '0.0.2';

var postcss = require('postcss');

var _pack = function (css, opts) {
  var packer = postcss(function (css) {
    var queries = {};

    css.each(function (rule, i) {
      if (rule.type !== 'atrule' && rule.name !== 'media') {
        return true;
      }

      var query = rule._params;

      if (typeof queries[query] === 'object') {
        queries[query].rules.reverse();
        queries[query].each(function (r) {
          rule.prepend(r);
        });
        queries[query].removeSelf();
      }

      queries[query] = rule;
    });

    return css;
  });

  return packer.process(css, opts);
};

exports.pack = _pack;

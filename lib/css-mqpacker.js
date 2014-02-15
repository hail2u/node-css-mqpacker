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
    var newCss = postcss.root();
    var rules = [];
    var queries = [];

    for (var i = 0, l = css.rules.length; i < l; i++) {
      var rule = css.rules[i];

      if (rule.type !== 'atrule' && rule.name !== 'media') {
        rules.push(rule);

        continue;
      }

      var query = rule._params;
      var index = _getQueryIndex(queries, query);

      if (index >= 0) {
        _addRules(rule.rules, queries[index].rule);
      } else {
        queries.push({
          query: query,
          rule: rule
        });
      }
    }

    newCss.rules = rules.concat(_flatten(queries));

    return newCss;
  });

  return packer.process(css, opts);
};

var _getQueryIndex = function (queries, query) {
  for (var i = 0, l = queries.length; i < l; i++) {
    if (queries[i].query === query) {
      return i;
    }
  }

  return -1;
};

var _addRules = function (rules, to) {
  for (var i = 0, l = rules.length; i < l; i++) {
    to.append(rules[i]);
  }

  return;
};

var _flatten = function (queries) {
  var rules = [];

  for (var i = 0, l = queries.length; i < l; i++) {
    rules.push(queries[i].rule);
  }

  return rules;
};

exports.pack = _pack;

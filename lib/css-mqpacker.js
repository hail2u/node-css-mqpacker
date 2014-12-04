'use strict';

var postcss = require('postcss');

exports.postcss = exports.processor = function (css) {
  var queries = {};
  var params = [];

  css.each(function (rule) {
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

  var haveSourceMap = false;

  if (
    css.last &&
    css.last.type === 'comment' &&
    css.last.text.toLowerCase().indexOf('# sourcemappingurl=') === 0
  ) {
    haveSourceMap = true;
  }

  params.forEach(function (param) {
    var rule = queries[param];

    if (haveSourceMap) {
      css.insertBefore(css.last, rule);

      return;
    }

    css.append(rule);
  });

  return css;
};

exports.pack = function (css, opts) {
  return postcss().use(this.postcss).process(css, opts);
};

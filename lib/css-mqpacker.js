'use strict';

var postcss = require('postcss');

exports.postcss = function (css) {
  var queries = {};
  var params = [];
  var sourceMap;

  css.each(function (rule) {
    if (rule.type !== 'atrule' || rule.name !== 'media') {
      return;
    }

    var query = rule.params;
    var past = queries[query];

    if (typeof past === 'object') {
      rule.each(function (r) {
        past.append(r.clone());
      });
    } else {
      queries[query] = rule.clone();
      params.push(query);
    }

    rule.removeSelf();
  });

  if (
    css.last &&
    css.last.type === 'comment' &&
    css.last.text.toLowerCase().indexOf('# sourcemappingurl=') === 0
  ) {
    sourceMap = css.last;
  }

  params.forEach(function (param) {
    css.append(queries[param]);
  });

  if (sourceMap) {
    sourceMap.moveTo(css);
  }

  return css;
};

exports.pack = function (css, opts) {
  return postcss().use(this.postcss).process(css, opts);
};

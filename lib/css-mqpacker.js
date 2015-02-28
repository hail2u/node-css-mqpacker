'use strict';

var postcss = require('postcss');

var hasSourceMapAnnotation = function (css) {
  if (!css.last) {
    return false;
  }

  if (css.last.type !== 'comment') {
    return false;
  }

  if (css.last.text.toLowerCase().indexOf('# sourcemappingurl=') !== 0) {
    return false;
  }

  return true;
};

exports.postcss = function (css) {
  var params = [];
  var queries = {};
  var sourceMap;

  if (hasSourceMapAnnotation(css)) {
    sourceMap = css.last;
  }

  css.eachAtRule('media', function (rule) {
    var past;
    var query = rule.params;
    past = queries[query];

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

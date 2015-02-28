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
  var queries = {};
  var queryLists = [];
  var sourceMap;

  if (hasSourceMapAnnotation(css)) {
    sourceMap = css.last;
  }

  css.eachAtRule('media', function (atRule) {
    var past;
    var queryList = atRule.params;
    past = queries[queryList];

    if (typeof past === 'object') {
      atRule.each(function (rule) {
        past.append(rule.clone());
      });
    } else {
      queries[queryList] = atRule.clone();
      queryLists.push(queryList);
    }

    atRule.removeSelf();
  });

  queryLists.forEach(function (queryList) {
    css.append(queries[queryList]);
  });

  if (sourceMap) {
    sourceMap.moveTo(css);
  }

  return css;
};

exports.pack = function (css, opts) {
  return postcss().use(this.postcss).process(css, opts);
};

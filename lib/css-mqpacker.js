'use strict';

var postcss = require('postcss');

var process = function (css) {
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
    /^# sourceMappingURL=/i.test(css.last.text)
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

var pack = function (css, opts) {
  return postcss().use(this.processor).process(css, opts);
};

exports.postcss = process;
exports.pack = pack;

// Old interface
exports.processor = process;

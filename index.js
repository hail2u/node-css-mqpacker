"use strict";

var list = require("postcss/lib/list");
var pkg = require("./package.json");
var postcss = require("postcss");

var isSourceMapAnnotation = function (rule) {
  if (!rule) {
    return false;
  }

  if (rule.type !== "comment") {
    return false;
  }

  if (rule.text.toLowerCase().indexOf("# sourcemappingurl=") !== 0) {
    return false;
  }

  return true;
};

var parseQueryList = function (queryList) {
  var queries = [];
  list.comma(queryList).forEach(function (query) {
    var expressions = {};
    list.space(query).forEach(function (expression) {
      var feature;
      var value;
      expression = expression.toLowerCase();

      if (expression === "and") {
        return;
      }

      if (/^\w+$/.test(expression)) {
        expressions[expression] = true;

        return;
      }

      expression = list.split(expression.replace(/^\(|\)$/g, ""), [":"]);
      feature = expression[0];
      value = expression[1];

      if (!expressions[feature]) {
        expressions[feature] = [];
      }

      expressions[feature].push(value);
    });
    queries.push(expressions);
  });

  return queries;
};

var inspectLength = function (length) {
  var num;
  var unit;
  length = /(-?\d*\.?\d+)(ch|em|ex|px|rem)/.exec(length);

  if (!length) {
    return Number.MAX_VALUE;
  }

  num = length[1];
  unit = length[2];

  switch (unit) {
  case "ch":
    num = parseFloat(num) * 8.8984375;

    break;

  case "em":
  case "rem":
    num = parseFloat(num) * 16;

    break;

  case "ex":
    num = parseFloat(num) * 8.296875;

    break;

  case "px":
    num = parseFloat(num);

    break;
  }

  return num;
};

var pickMinimumMinWidth = function (expressions) {
  var minWidths = [];
  expressions.forEach(function (feature) {
    var minWidth = feature["min-width"];

    if (!minWidth || feature.not || feature.print) {
      minWidth = [null];
    }

    minWidths.push(minWidth.map(inspectLength).sort(function (a, b) {
      return b - a;
    })[0]);
  });

  return minWidths.sort(function (a, b) {
    return a - b;
  })[0];
};

var sortQueryLists = function (queryLists, sort) {
  var mapQueryLists = [];

  if (!sort) {
    return queryLists;
  }

  if (typeof sort === "function") {
    return queryLists.sort(sort);
  }

  queryLists.forEach(function (queryList) {
    mapQueryLists.push(parseQueryList(queryList));
  });

  return mapQueryLists.map(function (e, i) {
    return {
      index: i,
      value: pickMinimumMinWidth(e)
    };
  }).sort(function (a, b) {
    return a.value - b.value;
  }).map(function (e) {
    return queryLists[e.index];
  });
};

module.exports = postcss.plugin(pkg.name, function (opts) {
  if (!opts) {
    opts = {};
  }

  if (!opts.sort) {
    opts.sort = false;
  }

  return function (css) {
    var queries = {};
    var queryLists = [];
    var sourceMap = css.last;

    if (!isSourceMapAnnotation(sourceMap)) {
      sourceMap = null;
    }

    css.walkAtRules("media", function (atRule) {
      var past;
      var queryList = atRule.params;
      past = queries[queryList];

      if (typeof past === "object") {
        atRule.each(function (rule) {
          past.append(rule.clone());
        });
      } else {
        queries[queryList] = atRule.clone();
        queryLists.push(queryList);
      }

      atRule.remove();
    });

    sortQueryLists(queryLists, opts.sort).forEach(function (queryList) {
      css.append(queries[queryList]);
    });

    if (sourceMap) {
      sourceMap.moveTo(css);
    }

    return css;
  };
});

module.exports.pack = function (css, opts) {
  return postcss([
    this(opts)
  ]).process(css, opts);
};

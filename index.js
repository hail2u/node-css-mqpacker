const list = require("postcss/lib/list");
const pkg = require("./package.json");
const postcss = require("postcss");

const isSourceMapAnnotation = rule => {
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

const parseQueryList = queryList => {
  const queries = [];

  list.comma(queryList).forEach(query => {
    const expressions = {};

    list.space(query).forEach(expression => {
      let newExpression = expression.toLowerCase();

      if (newExpression === "and") {
        return;
      }

      if (/^\w+$/.test(newExpression)) {
        expressions[newExpression] = true;

        return;
      }

      newExpression = list.split(newExpression.replace(/^\(|\)$/g, ""), [":"]);
      const [feature, value] = newExpression;

      if (!expressions[feature]) {
        expressions[feature] = [];
      }

      expressions[feature].push(value);
    });
    queries.push(expressions);
  });

  return queries;
};

const inspectLength = length => {
  if (length === "0") {
    return 0;
  }

  const matches = /(-?\d*\.?\d+)(ch|em|ex|px|rem)/.exec(length);

  if (!matches) {
    return Number.MAX_VALUE;
  }

  matches.shift();
  const [num, unit] = matches;
  let newNum = num;

  switch (unit) {
    case "ch":
      newNum = parseFloat(newNum) * 8.8984375;

      break;

    case "em":
    case "rem":
      newNum = parseFloat(newNum) * 16;

      break;

    case "ex":
      newNum = parseFloat(newNum) * 8.296875;

      break;

    case "px":
      newNum = parseFloat(newNum);

      break;
  }

  return newNum;
};

const pickMinimumMinWidth = expressions => {
  const minWidths = [];

  expressions.forEach(feature => {
    let minWidth = feature["min-width"];

    if (!minWidth || feature.not || feature.print) {
      minWidth = [null];
    }

    minWidths.push(minWidth.map(inspectLength).sort((a, b) => b - a)[0]);
  });

  return minWidths.sort((a, b) => a - b)[0];
};

const sortQueryLists = (queryLists, sort) => {
  const mapQueryLists = [];

  if (!sort) {
    return queryLists;
  }

  if (typeof sort === "function") {
    return queryLists.sort(sort);
  }

  queryLists.forEach(queryList => {
    mapQueryLists.push(parseQueryList(queryList));
  });

  return mapQueryLists
    .map((e, i) => ({
      index: i,
      value: pickMinimumMinWidth(e)
    }))
    .sort((a, b) => a.value - b.value)
    .map(e => queryLists[e.index]);
};

module.exports = postcss.plugin(pkg.name, options => {
  const opts = {
    sort: false,
    ...options
  };

  return css => {
    const queries = {};
    const queryLists = [];

    let sourceMap = css.last;

    if (!isSourceMapAnnotation(sourceMap)) {
      sourceMap = null;
    }

    css.walkAtRules("media", atRule => {
      if (atRule.parent.parent && atRule.parent.parent.type !== "root") {
        return;
      }

      if (atRule.parent.type !== "root") {
        const newAtRule = postcss.atRule({
          name: atRule.parent.name,
          params: atRule.parent.params
        });

        atRule.each(rule => {
          newAtRule.append(rule);
        });
        atRule.remove();
        atRule.removeAll();
        atRule.append(newAtRule);
      }

      const queryList = atRule.params;
      const past = queries[queryList];

      if (typeof past === "object") {
        atRule.each(rule => {
          past.append(rule.clone());
        });
      } else {
        queries[queryList] = atRule.clone();
        queryLists.push(queryList);
      }

      atRule.remove();
    });

    sortQueryLists(queryLists, opts.sort).forEach(queryList => {
      css.append(queries[queryList]);
    });

    if (sourceMap) {
      css.append(sourceMap);
    }
  };
});

module.exports.pack = function(css, opts) {
  return postcss([this(opts)]).process(css, opts);
};

"use strict";

const list = require("postcss/lib/list");
const pkg = require("./package.json");
const postcss = require("postcss");

function isSourceMapAnnotation(rule) {
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
}

function parseQueryList(queryList) {
  const queries = [];

  list.comma(queryList).forEach((query) => {
    const expressions = {};

    list.space(query).forEach((expression) => {
      expression = expression.toLowerCase();

      if (expression === "and") {
        return;
      }

      if (/^\w+$/.test(expression)) {
        expressions[expression] = true;

        return;
      }

      expression = list.split(expression.replace(/^\(|\)$/g, ""), [":"]);
      const feature = expression[0];
      const value = expression[1];

      if (!expressions[feature]) {
        expressions[feature] = [];
      }

      expressions[feature].push(value);
    });
    queries.push(expressions);
  });

  return queries;
}

function inspectLength(length) {
  length = /(-?\d*\.?\d+)(ch|em|ex|px|rem)/.exec(length);

  if (!length) {
    return Number.MAX_VALUE;
  }

  let num = length[1];
  const unit = length[2];

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
}

function pickMinimumMinWidth(expressions) {
  const minWidths = [];

  expressions.forEach((feature) => {
    let minWidth = feature["min-width"];

    if (!minWidth || feature.not || feature.print) {
      minWidth = [null];
    }

    minWidths.push(minWidth.map(inspectLength).sort((a, b) => {
      return b - a;
    })[0]);
  });

  return minWidths.sort((a, b) => {
    return a - b;
  })[0];
}

function sortQueryLists(queryLists, sort) {
  const mapQueryLists = [];

  if (!sort) {
    return queryLists;
  }

  if (typeof sort === "function") {
    return queryLists.sort(sort);
  }

  queryLists.forEach((queryList) => {
    mapQueryLists.push(parseQueryList(queryList));
  });

  return mapQueryLists.map((e, i) => {
    return {
      index: i,
      value: pickMinimumMinWidth(e)
    };
  })
    .sort((a, b) => {
      return a.value - b.value;
    })
    .map((e) => {
      return queryLists[e.index];
    });
}

module.exports = postcss.plugin(pkg.name, (opts) => {
  if (!opts) {
    opts = {};
  }

  opts = Object.assign({
    sort: false
  }, opts);

  return function (css) {

    // get source-map annotation
    let sourceMap = css.last;

    if (!isSourceMapAnnotation(sourceMap)) {
      sourceMap = null;
    }

    const groups = {};
    let _groupId = 0;

    // give root node an mqpacker group id
    css._mqpackerGroupId = _groupId;

    // find '@media' rules
    css.walkAtRules('media', (atRule) => {

      // get '@media' rule's group
      let _searchForGroup = true,
        parent = atRule.parent,
        // default to root group
        group = {
          id: 0,
          type: 'root',
          node: css
        };

      // search for '@mqpack' rule in ancestors
      while (_searchForGroup && parent)
      {
        // if '@media' rule is nested in a '@mqpack' rule
        if (parent.type == 'atrule' && parent.name == 'mqpack') {
          // set/get parent's mqpacker group id
          parent._mqpackerGroupId = parent._mqpackerGroupId || ++_groupId;
          // set the '@media' group attributes to represent th '@mqpack' node
          group = {
            id: parent._mqpackerGroupId,
            node: parent,
            type: 'mqpack'
          };

          _searchForGroup == false;
        }

        // check next ancestor
        parent = parent.parent;
      }

      // register new '@media' query groups
      if (!groups.hasOwnProperty(group.id)) {
        group.queries = {};
        group.queryLists = [];
        groups[group.id] = group;
      }

      const queryList = atRule.params;
      const past = groups[group.id].queries[queryList];

      // if another '@media' with same params was already found
      if (typeof past === "object") {
        // add rules from this '@media' to the one found before
        atRule.each((rule) => {
          past.append(rule.clone());
        });
      } else {
        // clone current '@media' and register for further processing
        groups[group.id].queries[queryList] = atRule.clone();
        groups[group.id].queryLists.push(queryList);
      }

      // remove '@media' node
      atRule.remove();

    });

    // re-inject '@media' nodes in-place
    for (var groupId in groups)
    {
      let group = groups[groupId];      

      // sort collected '@media' nodes in group
      sortQueryLists(group.queryLists, opts.sort).forEach((queryList) => {
        // and add them at the end of the group's node
        group.node.append(group.queries[queryList]);
      });

      // replace '@mqpack' nodes with their contents
      if (group.type == 'mqpack')
      {
        group.node.each((rule) => {
          rule.moveBefore(group.node);
        });

        group.node.remove();
      }
    };

    // move source-map annotation to the end
    if (sourceMap) {
      css.append(sourceMap);
    }

    // return resulting css tree
    return css;
  };
});

module.exports.pack = function (css, opts) {
  return postcss([
    this(opts)
  ]).process(css, opts);
};

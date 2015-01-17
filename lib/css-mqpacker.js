'use strict';

var postcss = require('postcss');

exports.postcss = function (css) {
  var queries = {};
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

  queries = sortQueries(queries);

  queries.forEach(function (rule) {
    css.append(rule);
  });

  if (sourceMap) {
    sourceMap.moveTo(css);
  }

  return css;
};

exports.pack = function (css, opts) {
  return postcss().use(this.postcss).process(css, opts);
};

/**
 * Sort media queries by kind, this is needed to output them in the right order
 * @param {AtRule[]} queries
 *
 * Function code from https://github.com/buildingblocks/grunt-combine-media-queries
 */
var sortQueries = function (queries) {
  var byType = {};
  byType.all = [];
  byType.minWidth = [];
  byType.maxWidth = [];
  byType.minHeight = [];
  byType.maxHeight = [];
  byType.print = [];
  byType.blank = [];

  Object.keys(queries).forEach(function (key) {
    /** @type AtRule */
    var item = queries[key];
    if (key.match(/min-width/)) {
      byType.minWidth.push(item);
    }
    else if (key.match(/min-height/)) {
      byType.minHeight.push(item);
    }
    else if (key.match(/max-width/)) {
      byType.maxWidth.push(item);
    }
    else if (key.match(/max-height/)) {
      byType.maxHeight.push(item);
    }
    else if (key.match(/print/)) {
      byType.print.push(item);
    }
    else if (key.match(/all/)) {
      byType.all.push(item);
    }
    else {
      byType.blank.push(item);
    }
  });
  /**
   * Function to determine sort order
   * @param {AtRule} a
   * @param {AtRule} b
   * @param {boolean} isMax
   * @returns {number}
   */
  var determineSortOrder = function (a, b, isMax) {
    var sortValA = parseFloat(a.params.match(/\d+/g)),
      sortValB = parseFloat(b.params.match(/\d+/g));
    isMax = typeof isMax !== 'undefined' ? isMax : false;
    // consider print for sorting if sortVals are equal
    if (sortValA === sortValB) {
      if (a.params.match(/print/)) {
        // a contains print and should be sorted after b
        return 1;
      }
      if (b.params.match(/print/)) {
        // b contains print and should be sorted after a
        return -1;
      }
    }
    // return descending sort order for max-(width|height) media queries
    if (isMax) {
      return sortValB - sortValA;
    }
    // return ascending sort order
    return sortValA - sortValB;
  };
  // Sort queries ascending
  byType.all.sort(determineSortOrder);
  byType.minWidth.sort(determineSortOrder);
  byType.minHeight.sort(determineSortOrder);
  // Sort queries descending
  byType.maxWidth.sort(function (a, b) {
    return determineSortOrder(a, b, true);
  });
  byType.maxHeight.sort(function (a, b) {
    return determineSortOrder(a, b, true);
  });

  var sortedTypes = [
    byType.blank,
    byType.all,
    byType.minWidth,
    byType.minHeight,
    byType.maxWidth,
    byType.maxHeight,
    byType.print
  ];
  return sortedTypes.reduce(
    function (previousValue, currentValue) {
      return previousValue.concat(currentValue);
    },
    []
  );
};

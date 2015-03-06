'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var mqpacker = require('../index');

exports['Public API'] = function (test) {
  var expected;
  var input = '@media (min-width:1px) {\n    .foo {\n        color: black\n    }\n}';
  expected = postcss().process(input).css;

  test.expect(4);

  test.strictEqual(
    mqpacker.pack(input).css,
    expected
  );

  test.strictEqual(
    mqpacker().pack(input).css,
    expected
  );

  test.strictEqual(
    postcss().use(mqpacker.postcss).process(input).css,
    expected
  );

  test.strictEqual(
    postcss().use(mqpacker().postcss).process(input).css,
    expected
  );

  test.done();
};

exports['Option: PostCSS options'] = function (test) {
  var expected;
  var input = '@media (min-width:1px) {\n    .foo {\n        color: black\n    }\n}\n\n/*# sourceMappingURL=from.css.map */\n';
  var opts = {
    from: 'from.css',
    map: {
      inline: false
    }
  };
  var processed = mqpacker.pack(input, opts);
  expected = postcss().process(input, opts);

  test.expect(2);

  test.strictEqual(
    processed.css,
    expected.css
  );

  test.deepEqual(
    processed.map,
    expected.map
  );

  test.done();
};

exports['Option: sort'] = function (test) {
  var a;
  var b = mqpacker();
  var expected = '@media (min-width: 1px) {\n    .foo {\n        z-index: 1\n    }\n}\n@media (min-width: 2px) {\n    .foo {\n        z-index: 2\n    }\n}';
  var input = '@media (min-width: 2px) { .foo { z-index: 2 } }@media (min-width: 1px) { .foo { z-index: 1 } }';
  var opts = {
    sort: true
  };
  a = mqpacker(opts);

  test.expect(5);

  test.notStrictEqual(
    mqpacker.pack(input).css,
    expected
  );

  test.strictEqual(
    mqpacker(opts).pack(input).css,
    expected
  );

  test.strictEqual(
    mqpacker.pack(input, opts).css,
    expected
  );

  test.notStrictEqual(
    postcss().use(a.postcss).process(input).css,
    postcss().use(b.postcss).process(input).css
  );

  test.strictEqual(
    mqpacker({
      sort: function (c, d) {
        return c.localeCompare(d);
      }
    }).pack(input).css,
    expected
  );

  test.done();
};

exports['Real CSS'] = function (test) {
  var testCases = fs.readdirSync(path.join(__dirname, 'fixtures'));

  var loadExpected = function (file) {
    file = path.join(__dirname, 'expected', file);

    return fs.readFileSync(file, 'utf8');
  };

  var loadInput = function (file) {
    file = path.join(__dirname, 'fixtures', file);

    return fs.readFileSync(file, 'utf8');
  };

  test.expect(testCases.length);

  testCases.forEach(function (testCase) {
    var opts = {
      sort: false
    };

    if (testCase.indexOf('sort_') === 0) {
      opts.sort = true;
    }

    test.strictEqual(
      mqpacker.pack(loadInput(testCase), opts).css,
      loadExpected(testCase),
      testCase
    );
  });

  test.done();
};

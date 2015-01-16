'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var mqpacker = require('../index');

exports['Public API'] = function (test) {
  test.expect(2);

  var input = '@media (min-width:1px) {\n    .foo {\n        color: black\n    }\n}';
  var expected = postcss().process(input).css;

  test.strictEqual(
    mqpacker.pack(input).css,
    expected
  );

  test.strictEqual(
    postcss().use(mqpacker.postcss).process(input).css,
    expected
  );

  test.done();
};

exports['Option: PostCSS options'] = function (test) {
  test.expect(2);

  var input = '@media (min-width:1px) {\n    .foo {\n        color: black\n    }\n}';
  var opts = {
    from: 'from.css',
    map: {
      inline: false
    }
  };
  var processed = mqpacker.pack(input, opts);
  var expected = postcss().process(input, opts);

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

exports["Real CSS"] = function (test) {
  var testCases = fs.readdirSync(path.join(__dirname, 'fixtures'));
  var loadInput = function (file) {
    file = path.join(__dirname, 'fixtures', file);

    return fs.readFileSync(file, 'utf8');
  };
  var loadExpected = function (file) {
    file = path.join(__dirname, 'expected', file);

    return fs.readFileSync(file, 'utf8');
  };

  test.expect(testCases.length);

  testCases.forEach(function (testCase) {
    test.strictEqual(
      mqpacker.pack(loadInput(testCase)).css,
      loadExpected(testCase),
      testCase
    );
  });

  test.done();
};

'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var mqpacker = require('../index');

exports.API = function (test) {
  test.expect(3);

  var input = '@media (min-width:1px) {.foo{color:black}}';
  var expected = postcss().process(input).css;

  test.strictEqual(
    mqpacker.pack(input).css,
    expected
  );

  test.strictEqual(
    postcss().use(mqpacker.postcss).process(input).css,
    expected
  );

  // Old interface
  test.strictEqual(
    postcss().use(mqpacker.processor).process(input).css,
    expected
  );

  test.done();
};

exports['Option: PostCSS options'] = function (test) {
  test.expect(2);

  var opts = {
    map: true,
    from: 'from.css',
    to: 'to.css'
  };
  var input = '@media (min-width:1px) {.foo{color:black}}\n/*# sourceMappingURL=to.css.map */';
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

  testCases.forEach(function (testCase) {
    test.strictEqual(
      mqpacker.pack(loadInput(testCase)).css,
      loadExpected(testCase),
      testCase
    );
  });

  test.done();
};

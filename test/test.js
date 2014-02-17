/*jshint node:true */
'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');

var mqpacker = require('../index');

var fixtures = path.join(__dirname, 'fixtures');
var input = '';
var expected = '';
var opts = {};
var _loadInput = function (name) {
  return fs.readFileSync(path.join(fixtures, name + '-input.css'), {
    encoding: 'utf8'
  });
};
var _loadExpected = function (name) {
  return fs.readFileSync(path.join(fixtures, name + '-expected.css'), {
    encoding: 'utf8'
  });
};

exports.testPublicInterfaces = function (test) {
  test.expect(2);

  input = '.foo { color: black; }';
  expected = postcss.parse(input);
  test.strictEqual(mqpacker.pack(input).css, expected.toString());

  opts.map = true;
  test.strictEqual(mqpacker.pack(input, opts).map, expected.toResult(opts).map);

  test.done();
};

exports.testRealCSS = function (test) {
  test.expect(2);

  var testCases = ['simple', 'multi'];

  for (var i = 0, l = testCases.length; i < l; i++) {
    var testCase = testCases[i];
    input = _loadInput(testCase);
    expected = _loadExpected(testCase);
    test.strictEqual(mqpacker.pack(input).css, expected);
  }

  test.done();
};

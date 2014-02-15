/*jshint node:true */
'use strict';

var fs = require('fs');
var mqpacker = require('../index');
var path = require('path');
var postcss = require('postcss');

var fixtures = path.join(__dirname, 'fixtures');

exports.testPublicInterfaces = function (test) {
  test.expect(1);
  var css = '.foo { color: black; }';
  test.strictEqual(mqpacker.pack(css).css, postcss.parse(css).toString());
  test.done();
};

exports.testRealCSS = function (test) {
  test.expect(1);
  var input = fs.readFileSync(path.join(fixtures, 'test-input.css'), {
    encoding: 'utf8'
  });
  var output = fs.readFileSync(path.join(fixtures, 'test-output.css'), {
    encoding: 'utf8'
  }).replace(/\n$/, '');
  test.strictEqual(mqpacker.pack(input).css, output);
  test.done();
};

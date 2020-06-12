const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const mqpacker = require("../index");

const doNothing = postcss.plugin("do-nothing", () => () => "");

exports.Default = (test) => {
  const input = `.foo {
  z-index: 0;
}

@media (min-width:1px) {
  .foo {
    z-index: 1;
  }
}
`;
  const expected = postcss(doNothing).process(input).css;
  test.expect(1);
  test.strictEqual(postcss([mqpacker()]).process(input).css, expected);
  test.done();
};

exports["Option: sort"] = (test) => {
  const expected = `.foo {
  z-index: 0;
}

@media (min-width: 1px) {
  .foo {
    z-index: 1;
  }
}

@media (min-width: 2px) {
  .foo {
    z-index: 2;
  }
}
`;
  const input = `.foo {
  z-index: 0;
}

@media (min-width: 2px) {
  .foo {
    z-index: 2;
  }
}

@media (min-width: 1px) {
  .foo {
    z-index: 1;
  }
}
`;
  const opts = {
    sort: true
  };
  test.expect(2);
  test.notStrictEqual(
    postcss([mqpacker()]).process(input).css,
    postcss([mqpacker(opts)]).process(input).css
  );
  test.strictEqual(
    postcss([mqpacker({
      sort: (c, d) => c.localeCompare(d)
    })]).process(input).css,
    expected
  );
  test.done();
};

exports["Real CSS"] = (test) => {
  const testCases = fs.readdirSync(path.join(__dirname, "fixtures"));
  const readExpected = (file) =>
    fs.readFileSync(path.join(__dirname, "expected", file), "utf8");
  const readInput = (file) =>
    fs.readFileSync(path.join(__dirname, "fixtures", file), "utf8");
  test.expect(testCases.length);
  testCases.forEach((testCase) => {
    const opts = {
      sort: false
    };

    if (testCase.indexOf("sort_") === 0) {
      opts.sort = true;
    }

    test.strictEqual(
      postcss([mqpacker(opts)]).process(readInput(testCase)).css,
      readExpected(testCase),
      testCase
    );
  });
  test.done();
};

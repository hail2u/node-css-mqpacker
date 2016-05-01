CSS MQPacker
============

Pack same CSS media query rules into one media query rule.

Written with [PostCSS][1].


SYNOPSIS
--------

A CSS file processed with a CSS pre-processor may have same queries that can
merge:

```css
.foo::before {
  content: "foo on small";
}

@media screen and (min-width: 769px) {
  .foo::before {
    content: "foo on medium";
  }
}

.bar::before {
  content: "bar on small";
}

@media screen and (min-width: 769px) {
  .bar::before {
    content: "bar on medium";
  }
}
```

This PostCSS plugin packs exactly same queries (and optionally sorts) like this:

```css
.foo::before {
  content: "foo on small";
}

.bar::before {
  content: "bar on small";
}

@media screen and (min-width: 769px) {
  .foo::before {
    content: "foo on medium";
  }
  .bar::before {
    content: "bar on medium";
  }
}
```


INSTALL
-------

    $ npm install css-mqpacker


USAGE
-----

Of course, this package can be used as PostCSS plugin:

```javascript
#!/usr/bin/env node

"use strict";

var fs = require("fs");
var postcss = require("postcss");

var css = fs.readFileSync("from.css", "utf8");
postcss([
  require("autoprefixer-core")(),
  require("css-mqpacker")()
]).process(css).then(function (result) {
  console.log(result.css);
});
```


### As standard Node.js package

Read `from.css`, process its content, and output processed CSS to STDOUT.

```javascript
#!/usr/bin/env node

"use strict";

var fs = require("fs");
var mqpacker = require("css-mqpacker");

var original = fs.readFileSync("from.css", "utf8");
var processed = mqpacker.pack(original, {
  from: "from.css",
  map: {
    inline: false
  },
  to: "to.css"
});
console.log(processed.css);
```


### As CLI Program

This package also installs a command line interface.

    $ node ./node_modules/.bin/mqpacker --help
    Usage: mqpacker [options] INPUT [OUTPUT]
    
    Description:
      Pack same CSS media query rules into one media query rule.
    
    Options:
      -s, --sort       Sort `min-width` queries.
          --sourcemap  Create source map file.
      -h, --help       Show this message.
      -v, --version    Print version information.
    
    Use a single dash for INPUT to read CSS from standard input.

When PostCSS failed to parse INPUT, CLI shows a CSS parse error in GNU error
format instead of Node.js stack trace.

The `--sort` option does not currently support a custom function.


OPTIONS
-------

### sort

By default, CSS MQPacker pack and order media queries as they are defined. If
you want to sort queries automatically, pass `sort: true` to this module.

```javascript
postcss([
  mqpacker({
    sort: true
  })
]).process(css);
```

Currently, this option only supports `min-width` queries with specific units
(`ch`, `em`, `ex`, `px`, and `rem`). If you want to do more, you need to create
your own sorting function and pass it to this module like this:

```javascript
postcss([
  mqpacker({
    sort: function (a, b) {
      return a.localeCompare(b);
    }
  })
]).process(css);
```

In this example, all your queries will sort by A-Z order.

This sorting function directly pass to `Array#sort()` method of an array of all
your queries.


API
---

### pack(css, [options])

Packs media queries in `css`.

The second argument is optional. The `options` is same as the second argument of
PostCSS’s `process()` method. This is useful for generating Source Map.

```javascript
var fs = require("fs");
var mqpacker = require("css-mqpacker");

var css = fs.readFileSync("from.css", "utf8");
var result = mqpacker.pack(css, {
  from: "from.css",
  map: {
    inline: false
  },
  to: "to.css"
});
fs.writeFileSync("to.css", result.css);
fs.writeFileSync("to.css.map", result.map);
```

See also [PostCSS document][2] for more about this `options`.


LICENSE
-------

MIT: http://hail2u.mit-license.org/2014


[1]: https://github.com/postcss/postcss
[2]: https://github.com/postcss/postcss#source-map

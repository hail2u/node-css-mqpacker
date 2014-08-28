CSS MQPacker
============

Pack same CSS media query rules into one media query rule.

Written with [PostCSS][1].


INSTALLATION
------------

    $ npm install css-mqpacker

Or install as [Grunt plugin][2].


QUICK USAGE
-----------

Read `from.css`, process its content, and output processed CSS to STDOUT.

```js
#!/usr/bin/env node

'use strict';

var fs = require('fs');
var mqpacker = require('css-mqpacker');

var original = fs.readFileSync('from.css', 'utf8');
var processed = mqpacker.pack(original, {
  from: 'from.css',
  to: 'to.css',
  map: true
});
console.log(processed.css);
```

If `test.css` has:

```css
@charset "UTF-8";

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

You will get following output:

```css
@charset "UTF-8";

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

/*# sourceMappingURL=to.css.map */
```

Sweet!


API
---

### pack(css, [options])

Packs media queries in `css`.

The second argument is optional. The `options` is same as the second argument of
PostCSS's `process()` method. This is useful for generating Source Map.

```javascript
var fs = require('fs');
var mqpacker = require('mqpacker');

var css = fs.readFileSync('from.css', 'utf8');
var result = mqpakcer.pack(css, {
  from: 'from.css',
  to: 'to.css',
  map: true
});
fs.writeFileSync('to.css', result.css);
fs.writeFileSync('to.css.map', result.map);
```

See also [PostCSS document][3] for more about `options`.


### postcss

Returns [PostCSS processor][4].

You can use this property for combining with other PostCSS processors such as
[Autoprefixer][5].

```javascript
var autoprefixer = require('autoprefixer');
var mqpacker = require('mqpacker');
var postcss = require('postcss');

var css = fs.readFileSync('test.css', 'utf8');
postcss().use(
  autoprefixer.postcss
).use(
  mqpakcer.postcss
).process(css);
```


KNOWN ISSUE
-----------

CSS MQPacker changes order of rulesets. This may breaks CSS applying order.

```css
@media (min-width: 320px) {
  .foo {
    width: 100px;
  }
}

@media (min-width: 640px) {
  .bar {
    width: 200px;
  }
}

@media (min-width: 320px) {
  .baz {
    width: 300px;
  }
}
```

Becomes:

```css
@media (min-width: 320px) {
  .foo {
    width: 100px;
  }
  .baz {
    width: 300px;
  }
}

@media (min-width: 640px) {
  .bar {
    width: 200px;
  }
}
```

Fine. But If a HTML element has `class="bar baz"` and viewport width larget than
`640px`, that element `width` incorrectly set to `200px` instead of `300px`.


LICENSE
-------

MIT: http://hail2u.mit-license.org/2014


[1]: https://github.com/ai/postcss
[2]: https://github.com/hail2u/grunt-css-mqpacker
[3]: https://github.com/ai/postcss#source-map-1
[4]: https://github.com/ai/postcss#processor
[5]: https://github.com/ai/autoprefixer

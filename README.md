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

Read `from.css`, process its content, and output processed CSS to
STDOUT.

    #!/usr/bin/env node
    
    'use strict';
    
    var fs = require('fs');
    var mqpacker = require('css-mqpacker');
    
    var original = fs.readFileSync('from.css', {
      encoding: 'utf8'
    });
    var processed = mqpacker.pack(original, {
      from: 'from.css',
      to: 'to.css',
      map: true
    });
    console.log(processed.css);

If `test.css` has:

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

You will get following output:

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

Sweet!


API
---

### processor

This property returns core function of CSS MQPacker.

You can use this property for combining with other PostCSS processors
such as [Autoprefixer][3].

    var autoprefixer = require('autoprefixer');
    var mqpacker = require('mqpacker');
    var postcss = require('postcss');
    
    postcss().use(
      autoprefixer.postcss
    ).use(
      mqpakcer.processor
    ).process(css);


### pack(css, options)

This method packs media queries in a CSS.

An argument `css` is a `String` that contains CSS, and `options` is a
`Object` for outputting Source Map file.

    var fs = require('fs');
    var mqpacker = require('mqpacker');
    
    var result = mqpakcer.pack(css, {
      from: 'from.css',
      to: 'to.css',
      map: true
    });
    fs.writeFileSync('to.css', result.css);
    fs.writeFileSync('to.css.map', result.map);

See also [PostCSS document][4] for more about `options`.


LICENSE
-------

MIT: http://hail2u.mit-license.org/2014


[1]: https://github.com/ai/postcss
[2]: https://github.com/hail2u/grunt-css-mqpacker
[3]: https://github.com/ai/autoprefixer
[4]: https://github.com/ai/postcss#source-map-1

CSS MQPacker
============

Pack same CSS media query rules into one media query rule.

Written with [PostCSS][1].


INSTALLATION
------------

    $ npm install css-mqpacker


QUICK USAGE
-----------

Read `from.css`, process its content, and output processed CSS to STDOUT.

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


LICENSE
-------

MIT: http://hail2u.mit-license.org/2014


[1]: https://github.com/ai/postcss

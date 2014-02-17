CSS MQPacker
============

Pack same CSS media query rules into one media query rule.

Written with [PostCSS][1].


INSTALLATION
------------

    $ npm install css-mqpacker


QUICK USAGE
-----------

Read `test.css`, process content, and output processed CSS to STDOUT.

    #!/usr/bin/env node
    
    'use strict'
    
    var fs = require('fs');
    var mqpacker = require('css-mqpacker');
    
    var original = fs.readFileSync('test.css', {
      encoding: 'utf8'
    });
    var processed = mqpacker.pack(original, { from: 'test.css', to 'test.css' });
    console.log(processed.css);

If `test.css` has:

    .foo:before {
      content: "foo on small";
    }
    
    @media (min-width: 769px) {
      .foo:before {
        content: "foo on medium";
      }
    }
    
    .bar:before {
      content: "bar on small";
    }
    
    @media (min-width: 769px) {
      .bar:before {
        content: "bar on medium";
      }
    }

You will get following output:

    .foo:before {
      content: "foo on small";
    }
    
    .bar:before {
      content: "bar on small";
    }
    
    @media (min-width: 769px) {
      .foo:before {
        content: "foo on medium";
      }
      .bar:before {
        content: "bar on medium";
      }
    }

Sweet!


LICENSE
-------

MIT: http://hail2u.mit-license.org/2014


[1]: https://github.com/ai/postcss

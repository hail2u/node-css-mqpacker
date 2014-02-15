CSS MQPacker
============

Pack same CSS media query rules into one media query rule.


INSTALLATION
------------

    $ npm install css-mqpacker


QUICK USAGE
-----------

Read `test.css`, process content, and output processed CSS to STDOUT.

    var mqpacker = require('css-mqpacker');
    
    var original = fs.readFileSync('test.css', {
      encoding: 'utf8'
    });
    var processed = mqpacker.pack(original).css;
    console.log(processed);


LICENSE
-------

MIT: http://hail2u.mit-license.org/2013

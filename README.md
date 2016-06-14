# minus-watch [![NPM version][npm-image]][npm-url]

Watch, run, auto-reload, enjoy !

A bootstrap utility that watches your code, working dir, and given additional paths, and reload everything when something changes.

Minus-watch will check if there is a `-w` or `--watch` flag in your command-line and run your app in "watch & reload" mode if it is the case.

Synopsis:

    require('minus-watch')({
      run: __dirname+'/app',
      msg: require('chalk').gray('\nWait for change on files. r to reload, q to quit\n')
    })


[npm-url]: https://npmjs.org/package/minus-watch
[npm-image]: https://badge.fury.io/js/minus-watch.png
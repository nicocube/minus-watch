/*
 * Copyright 2016 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var fs = require('fs')
  , chalk = require('chalk')
  , options
  , watched = []

function minusWatch(opt) {
  'use strict'
  if (typeof options === 'string') {
    options = {
      run: opt
    }
  } else if (typeof opt === 'object') {
    if (!('run' in opt)) throw new Error("Options object must define a run property: "+opt)
    options = opt
  } else {
    throw new Error("Options must be either an object or a string: "+(typeof options))
  }

  var defaultOptions = {
    flags: ['w', 'watch'],
    stackTraceFlags : ['S', 'stacktrace'],
    msg: '---\n'
  }
  Object.keys(defaultOptions).forEach(function(k) {
    if (!(k in options)) {
      options[k] = defaultOptions[k]
    }
  })

  var argv = require('minimist')(process.argv.slice(2))
  
  options.isWatching = options.flags.some(function (k) { return argv[k] })
  options.isPrintStackTrace = options.stackTraceFlags.some(function (k) { return argv[k] })
    
  if (! options.isWatching) {
    require(options.run)()
  } else {
    var keys = Object.keys(require.cache)
    
    run()
    
    Object.keys(require.cache)
    .filter(not(RegExp.prototype.test.bind(/node_modules/)))
    .filter(function(k) { return keys.indexOf(k) === -1 })
    .forEach(push_in_watched)
    
    watched.forEach(register)
    
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', function (chunk) {
      console.log(chunk)
      if (chunk==='q' || chunk==='\u0003') process.exit(0)
      if (chunk==='r') {
        run()
      }
    })
    process.stdin.on('end', function () {
      process.exit(0)
    })
    process.stdin.setRawMode(true)
    process.stdin.resume()
    
  }  
}

function run() {
  try {
    require(options.run)()
    process.stdout.write(options.msg+'\n')
  } catch(e) {
    if (!options.isPrintStackTrace) process.stderr.write(chalk.magenta('ERROR:'+e.message+'\n'))
    else process.stderr.write(chalk.magenta(e.stack+'\n'))
    process.stdout.write(options.msg+'\n')
  }
}

function not(f) {
  return function(x) {
    return !f(x)
  }
}

function push_in_watched(k) {
  watched.push(k)
}

function add(l) {
  l.forEach(push_in_watched)
}

function register(filename){
  fs.watchFile(
    filename,
    { interval: 1000 },  
    function() {
      process.stdout.write(chalk.inverse('\nUpdate found on '+filename+'\n'))
      if (typeof filename === 'string' && filename in require.cache) {
        delete require.cache[filename]
      }
      run()
    }
  )
}

minusWatch.add = add

module.exports = minusWatch
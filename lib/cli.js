#!/usr/bin/env node
const fs = require('fs');
const meow = require('meow');
const glob = require('glob');
const JSON5 = require('json5');
const anylint = require('..');

const cli = meow(`
  Usage
    $ anylint <input>

  Options
    --config, -c  Specify config file

  Examples
    $ anylint foo.js
    1:2 error message rulename

    # With -c
    $ anylint bar.js -c ./.anylintrc

    # Use glob for input
    $ anylint 'lib/*.js'
`,
  {
    flags: {
      config: {
        type: 'string',
        alias: 'c'
      }
    }
  }
);

let settings;
if (cli.flags.config) {
  try {
    settings = JSON5.parse(fs.readFileSync(cli.flags.config, 'utf8'));
  } catch (e) {
    console.log(`Failed to parse "${cli.flags.config}". Using .anylintrc instead...`);
  }
}
if (!settings) {
  settings = require('rc')('anylint', null, null, JSON5.parse);
}

cli.input.forEach(input => {
  if (fs.statSync(input).isDirectory()) {
    input = input.replace(/\/?$/, '/**/*');
  }
  glob.sync(input, {realpath: true}).map(f => anylint(f, settings));
});

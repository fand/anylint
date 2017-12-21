# Anylint

> Linter for any languages.

![TravisCI badge](https://img.shields.io/travis/fand/anylint.svg)

Anylint is a linter created to lint anything with custom rules.
You can easily write your own linters in any languages!


## Install

```
npm install -g anylint
```


## Usage

```sh
$ anylint foo.js
```

To specify rc file, use `--config`:

```sh
$ anylint foo.pl --config ./custom-anylintrc
```


### `.anylintrc`

Anylint can be configured by `.anylintrc` files.
`.anylintrc` is parsed as [JSON5](https://github.com/json5/json5) format.
Write settings like below and put it to the project root or your `$HOME/.anylintrc`.

```js
{
  // Rules applied for all files
  "*": {
    // Key must be the path of executable
    "~/bin/lint-trailing-whitespace.sh": 2  // 2 is error
  },

  // Rules for `.js` files
  ".js": {
    "~/bin/eslint-wrapper.js": 2,
    "~/bin/jshint-wrapper.pl": 2,
  },
}
```


## Writing Rules

Anylint accepts any rules you write.
Rules must satisfy following spec:

- Rules must be executable file (Don't forget `chmod +x`)
- Rules take code to lint from `stdin`
- Rules output errors in JSON format

```sh
$ cat foo.md | ./rule.pl
[{
  line: 1,
  column: 1,
  message: "Invalid indent",
  ruleId: "indent"
}, {
  line: 10,
  column: 13,
  message: "Use snake_case for variables",
  ruleId: "snake-case"
}]
```

Errors must have following properties:

- line
- column
- message
- ruleId

Note that `line` and `column` starts from `1`, not `0`.


### Examples

in JavaScript:

```js
#!/usr/bin/env node
// This rule disallows more than 2 blank lines

process.stdin.on('data', data => {
  const lines = data.toString().split('\n');
  let lastline = 'DUMMY';

  let errors = [];
  lines.forEach((line, lineNum) => {
    if (lastline.match(/^\s*$/) && line.match(/^\s*$/)) {
      errors.push({
        line: lineNum + 1,
        column: 1,
        message: 'Too many blank lines!',
        ruleId: 'no-multiple-blank-lines'
      });
    }
    lastline = line;
  });

  console.log(JSON.stringify(errors));
});
```

in Perl:

```perl
#!/usr/bin/env perl
# This rule disallows more than 2 blank lines
use strict;
use warnings;
use JSON;
use v5.010;

my $errors = [];

my $linenum = 1;
my $lastline = 'DUMMY';
while (<>) {
  my $line = $_;
  if ($line =~ /^\s*$/ && $lastline =~ /^\s*$/) {
    push @$errors, {
      line => $linenum,
      column => 1,
      message => 'Too many blank lines!',
      ruleId => 'no-multiple-blank-lines',
    }
  }
  $linenum++;
  $lastline = $line;
}

say encode_json($errors);
```


## LICENSE

MIT

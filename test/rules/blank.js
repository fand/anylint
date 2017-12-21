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

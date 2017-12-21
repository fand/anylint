#!/usr/bin/env node

process.stdin.on('data', data => {
  const lines = data.toString().split('\n');

  let errors = [];

  lines.forEach((line, lineNum) => {
    line.replace(/\s(\w+_\w+)\s/g, (match, name, offset) => {
      errors.push({
        line: lineNum + 1,
        column: offset,
        message: `Variable "${name}" contains uppercase.`,
        ruleId: 'no-snake-case-variables'
      });
    });
  });

  console.log(JSON.stringify(errors));
});

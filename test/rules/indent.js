#!/usr/bin/env node
const eslint = require('eslint');
const getStdin = require('get-stdin');

getStdin().then(stdin => {
  const linter = new eslint.Linter();
  const messages = linter.verify(stdin, {
    parser: 'babel-eslint',
    rules: {
      indent: 2
    }
  });
  console.log(JSON.stringify(messages.map(m => ({
    line: m.line,
    column: m.column,
    message: m.message,
    ruleId: m.ruleId
  }))));
});

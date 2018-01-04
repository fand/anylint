import test from 'ava';
import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';

import { lintText } from '..';

const f = file => path.resolve(__dirname, file);

test(async t => {
  const file = f('./fixtures/test.pl');
  const code = fs.readFileSync(file, 'utf8');
  const settingsPath = f('./.anylintrc');
  const settings = JSON5.parse(fs.readFileSync(settingsPath, 'utf8'));
  const res = await lintText(code, file, settings, settingsPath);

  t.deepEqual(res[0], {
    line: 6,
    message: 'Don\'t use non-ascii characters.',
    ruleId: 'only-ascii',
    column: 13,
    severity: 2
  });
  t.deepEqual(res[1], {
    line: 7,
    column: 6,
    message: 'Don\'t use non-ascii characters.',
    ruleId: 'only-ascii',
    severity: 2,
  });
  t.deepEqual(res[2], {
    line: 10,
    column: 1,
    message: 'Line is too long',
    ruleId: 'line-length',
    severity: 1,
  });
  t.deepEqual(res[3], {
    line: 14,
    column: 1,
    message: 'Too many blank lines!',
    ruleId: 'no-multiple-blank-lines',
    severity: 2,
  });
  t.deepEqual(res[4], {
    line: 16,
    column: 4,
    message: 'Variable "fooBar" contains uppercase.',
    ruleId: 'no-camel-case-variables',
    severity: 2,
  });
});

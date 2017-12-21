import test from 'ava';
import execa from 'execa';
import path from 'path';

const f = file => path.resolve(__dirname, file);

test(async t => {
  const res = await execa(f('../lib/cli.js'), ['-c', f('./.anylintrc'), f('./fixtures/test.pl')]);
  const lines = res.stdout.split('\n');
  t.is(lines[0], f('./fixtures/test.pl'));
  t.is(lines[1], '  6:13\terror\tDon\'t use non-ascii characters.\tonly-ascii');
  t.is(lines[2], '  7:6\terror\tDon\'t use non-ascii characters.\tonly-ascii');
  t.is(lines[3], '  10:1\twarn\tLine is too long\tline-length');
  t.is(lines[4], '  14:1\terror\tToo many blank lines!\tno-multiple-blank-lines');
  t.is(lines[5], '  16:4\terror\tVariable "fooBar" contains uppercase.\tno-camel-case-variables');
});

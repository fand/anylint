const fs = require('fs');
const p = require('pify');
const execa = require('execa');
const chalk = require('chalk');
const logger = require('./logger');

const output = (file, outs) => {
  if (outs.length === 0) {
    return;
  }

  console.log(chalk.underline(file));

  const messages = [];

  outs.forEach(([json, rule, severity]) => {
    let messagesForRule;
    try {
      messagesForRule = JSON.parse(json);
    } catch (e) {
      console.log(json);
      throw new Error(`Failed to parse the output of ${rule}`);
    }

    messagesForRule.forEach(m => {
      if (
        m.line === undefined ||
        m.column === undefined ||
        m.message === undefined ||
        m.ruleId === undefined
      ) {
        throw new Error(`The output of ${rule} is invalid`);
      }

      // Override severity
      m.severity = severity;

      messages.push(m);
    });
  });

  messages.sort((a, b) => {
    if (a.line !== b.line) {
      return a.line - b.line;
    }
    return a.column - b.column;
  });

  messages.forEach(m => {
    console.log('  ' + [
      chalk.dim(m.line + ':' + m.column),
      (m.severity === 2 ? chalk.red('error') : chalk.yellow('warn')),
      m.message,
      chalk.dim(m.ruleId)
    ].join('\t'));
  });

  console.log();
};

const anylint = async (file, settings) => {
  const code = await p(fs.readFile)(file);

  const rulesAndSeverities = [];
  Object.keys(settings).forEach(key => {
    if (key !== '*' && !file.match(key)) {
      return;
    }

    const setting = settings[key];
    Object.keys(setting).forEach(rule => {
      const absoluteRule = rule.replace(/~/, process.env.HOME);
      rulesAndSeverities.push([absoluteRule, setting[rule]]);
    });
  });

  // Run linters in order
  Promise.all(rulesAndSeverities.map(([rule, severity]) => {
    return execa(rule, {input: code})
      .then(res => {
        return [res.stdout, rule, severity];
      })
      .catch(() => {
        throw new Error(`Can't access "${rule}". Is that executable?`);
      });
  }))
    .then(outs => {
      output(file, outs.filter(([x]) => x.trim() !== ''));
    })
    .catch(e => {
      logger.error(e.message);
      process.exit(-1);
    });
};

module.exports = anylint;
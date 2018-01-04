const fs = require('fs');
const path = require('path');
const p = require('pify');
const execa = require('execa');
const chalk = require('chalk');
const logger = require('./logger');

const parseErrors = outs => {
  const messages = [];

  outs.forEach(([json, rule, severity]) => {
    let messagesForRule;
    try {
      messagesForRule = JSON.parse(json);
    } catch (e) {
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

  return messages;
};

const output = (file, messages) => {
  if (messages.length === 0) {
    return;
  }

  console.log(chalk.underline(file));

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

const lintText = (code, file, settings, settingsPath) => {
  const rulesAndSeverities = [];
  Object.keys(settings).forEach(key => {
    if (key !== '*' && !file.match(key)) {
      return;
    }

    const setting = settings[key];
    Object.keys(setting).forEach(rule => {
      let absoluteRule = path.resolve(path.dirname(settingsPath), rule);
      absoluteRule = absoluteRule.replace(/^.*~/, process.env.HOME);
      rulesAndSeverities.push([absoluteRule, setting[rule]]);
    });
  });

  // Run linters in order
  return Promise.all(rulesAndSeverities.map(([rule, severity]) => {
    return execa(rule, {input: code})
      .then(res => {
        return [res.stdout, rule, severity];
      })
      .catch(e => {
        console.error(e);
        throw new Error(`Can't access "${rule}". Is that executable?`);
      });
  }))
    .then(outs => {
      return parseErrors(outs.filter(([x]) => x.trim() !== ''));
    })
    .catch(e => {
      logger.error(e.message);
      process.exit(-1);
    });
};

const lintFile = async (file, settings, settingsPath) => {
  const code = await p(fs.readFile)(file);
  return lintText(code, file, settings, settingsPath);
};

module.exports = {
  lintFile, lintText, output
};

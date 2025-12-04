/* eslint-disable */
const chalk = require('chalk');
const gitconfig = require('gitconfig');
const isValidString = require('./is-invalid-string');
// HUSKY_GIT_PARAMS had been removed
// const msgPath = process.env.HUSKY_GIT_PARAMS;
const msgPath = process.argv[process.argv.length - 1];

const msg = require('fs').readFileSync(msgPath, 'utf-8').trim();

const mergeRE = /^Merge branch/;
const commitRE = /^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types|build)(\(.+\))?: .{1,50}/;


const isMerge = mergeRE.test(msg);
const isValidCommit = commitRE.test(msg);
const isValidMsg = isValidString(msg, { includePunctuation: true });

if (!isValidMsg || !(isMerge || isValidCommit)) {
  console.log();
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`invalid commit message format.`)}\n\n` +
    chalk.red(`  Proper commit message format is required for automated changelog generation. Examples:\n\n`) +
    `    ${chalk.green(`feat(wallet): add getContractAddress`)}\n` +
    `    ${chalk.green(`fix(contract): handle contract conflict (close #28)`)}\n\n` +
    chalk.red(`  You can also use ${chalk.cyan(`npm run commit`)} to interactively generate a commit message.\n`)
  );
  process.exit(1);
}

// check git config
gitconfig.get({
  location: 'local'
}).then((config) => {
  if (!config.user || !config.user.email || !config.user.email.endsWith('@awaken.finance') || !isValidString(config.user.name, { includePunctuation: true })) {
    console.log(config.email);
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`invalid local email.`)}`
    );
    process.exit(1);
  }
})

/* eslint-enable */

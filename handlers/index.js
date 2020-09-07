#! /usr/bin/env node
const path = require('path');
const program = require('commander');
const shell = require('shelljs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const version = require('../package.json').version;

const main = (args) => {
    /**
     * ENVIRONMENT CHECK
     */
    // should support `git ` commands
    if (!shell.which('git')) {
        shell.echo(chalk.bold.red('Sorry, this script requires git'));
        shell.exit(1);
    }

    /**
     * Avoiding option name clashes
     * @see https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md#%e9%81%bf%e5%85%8d%e9%80%89%e9%a1%b9%e5%91%bd%e5%90%8d%e5%86%b2%e7%aa%81
     */
    program
        .storeOptionsAsProperties(false)
        .passCommandToAction(true);

    program.version(version);

    // register commands
    registerCommands(args);
};

function registerCommands(args) {
    /**
     * Creation
     * create a new project.
     */
    program
        .command("create <name>")
        .description("create a new project")
        .action((name) => {
            create(name);
        });

    program
        .on('--help', () => {
            shell.echo('\n  Run ' + chalk.cyan('che-cli <command> --help') + ' for detailed usage of given command.\n');
        });

    /**
     * Unknown commands
     */    
    program
        .command("*", { noHelp: true })
        .action(() => {
            program.outputHelp((info) => {
                shell.echo(info);
                shell.echo(chalk.bold.red('  Unknown command') + ' ' + chalk.rgb(230, 173, 8)(args.join(' ')) + chalk.bold.red('.'));
                return '';
            });
        });

    // It is important to parse args after registered commands,
    // or registration won't work.
    program.parse(process.argv);
}

async function create(name = 'my-project') {
    shell.echo(chalk.blue(`Che CLI v${version}\n`));
    shell.echo(`✨ Creating project in ${chalk.rgb(230, 173, 8)(path.resolve(`./${name}`))}.`);
    /**
     * I. prompt 
     */
    const questions = {
        preset: {
            type: 'list',
            name: 'preset',
            message: 'Please pick a preset:',
            choices: ['default', 'Vue CLI']
        },
        uiLib: {
            type: 'list',
            name: 'uiLib',
            message: 'Please pick an ui lib:',
            choices: ['no ui lib', 'che-ui']
        },
        confirm: {
            type: 'confirm',
            name: 'confirm',
            message: 'Creation?'
        }
    };
    const answers = await inquirer.prompt([questions.preset, questions.uiLib, questions.confirm]);
    if (!answers.confirm) {
        shell.echo(chalk.gray('Canceled.'));
        shell.exit(1);
        return false;
    }

    /**
     * II. SHELL COMMAND DEFINATIONS
     */
    // clone al-lib from github to project directory command
    const gitUrl = 'https://github.com/Apisit-Lee/al-lib.git';
    const fetchProjectCommand = `git clone ${gitUrl} ${name}`;

    shell.echo(chalk.blue(`Cloning files from ${gitUrl}...`));
    // execute command synchronously, 0 means success
    if (shell.exec(fetchProjectCommand).code !== 0) {
        shell.echo(chalk.bold.red('Error: fetch project files from git failed.'));
        shell.exit(1);
    }
    shell.echo(`🎉  Successfully created project ${chalk.rgb(230, 173, 8)(name)}.`);
    shell.echo('👉  Get started with the following commands:');
    shell.echo('');
    shell.echo(chalk.gray(' $ ') + chalk.cyan(`cd ${name}`));
    shell.echo(chalk.gray(' $ ') + chalk.cyan(`npm run serve`)); // TODO script differs in different choices.
    shell.echo('');
}

module.exports = main;
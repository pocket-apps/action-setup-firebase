import * as core from '@actions/core';
import * as exec from '@actions/exec';
import commandExists from 'command-exists';
import shell from 'shelljs';

const installWithBash = async () => {
  shell.exec('./install.sh');
};

const run = async () => {
  const token = core.getInput('firebase-token');
  const os = process.env.RUNNER_OS;

  if (!token) {
    throw new Error('Missing mandatory input: firebase-token');
  }

  core.exportVariable('FIREBASE_TOKEN', token);
  core.info('Exported environment variable FIREBASE_TOKEN');

  if (await commandExists('npm')) {
    core.info('Detected NPM installation');
    try {
      core.info('Trying to install firebase-tools using NPM');
      await exec.exec('npm', ['install', '-g', 'firebase-tools']);
    } catch (e) {
      core.info('Installation failed through NPM (maybe you forgot actions/setup-node before this action)');
      core.info('Trying BASH instead');
      await installWithBash();
    }
  } else if (os === 'Linux' || os === 'macOS') {
    core.info('Trying to install firebase-tools using BASH');
    await installWithBash();
  } else if (os === 'Windows') {
    throw new Error('On windows you must setup node before running this action');
  }
};

run()
  .then(() => core.info('Successfully installed firebase-tools CLI'))
  .catch(error => core.setFailed(error.message));

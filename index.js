import 'dotenv/config';
import { LeigodAPI } from './leigod.js';
import * as core from '@actions/core';

const api = new LeigodAPI();

const usernames = process.env.USERNAME_ARR.split(',');
const passwords = process.env.PASSWORD_ARR.split(',');

if (!usernames || !passwords) {
  core.setFailed(
    "please set USERNAME_ARR and PASSWORD_ARR in envs (split multi user by ',')",
  );
}

const users = [];

for (let idx = 0; idx < usernames.length; idx++) {
  const username = (usernames[idx] || '').trim();
  const password = (passwords[idx] || '').trim();
  users.push({ username, password });
}

async function pause(username, password) {
  if (username && password) {
    try {
      core.info('Login in to ' + username);
      await api.login(username, password);
      let isPaused = await api.isTimePaused();
      core.info('Getting pause status: ' + isPaused);
      if (!isPaused) {
        core.warning('Trying to pause time');
        await api.pauseTime();
        isPaused = await api.isTimePaused();
        core.info('Getting pause status again: ' + isPaused);
      }
    } catch (error) {
      core.error(error);
      return false;
    }
  } else {
    core.error('username or password is empty, please check envs' + username);
    return false;
  }
  return true;
}

let flag = true;

for (let idx = 0; idx < users.length; idx++) {
  const { username, password } = users[idx];
  const res = await pause(username, password);
  flag = flag && res;
}

if (!flag) core.setFailed('something went wrong! please check the logs.');

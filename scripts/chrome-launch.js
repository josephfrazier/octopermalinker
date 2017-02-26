#!/usr/bin/env node

const chromeLaunch = require('chrome-launch'); // eslint-disable-line import/no-extraneous-dependencies

const url = 'https://github.com/isaacs/github/issues/625#issuecomment-203464167';
const args = ['--load-extension=./dist'];

chromeLaunch(url, { args });
console.log('A new instance of Chrome should now be open in the background.'); // eslint-disable-line no-console

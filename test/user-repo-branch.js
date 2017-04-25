/* eslint-disable id-length, no-shadow */
import test from 'ava'
import userRepoBranch from '../lib/user-repo-branch'

test('https://github.com/OctoLinker/browser-extension/compare/v4.10.0...v4.11.0', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/OctoLinker/browser-extension/compare/v4.10.0...v4.11.0'), {
    user: 'OctoLinker',
    repo: 'browser-extension'
  })
})

test('https://github.com/prettier/prettier/pulls?q=is%3Apr+is%3Aclosed', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/prettier/prettier/pulls?q=is%3Apr+is%3Aclosed'), {
    user: 'prettier',
    repo: 'prettier'
  })
})

test('https://github.com/prettier/prettier/', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/prettier/prettier/'), {
    user: 'prettier',
    repo: 'prettier',
    branch: 'master',
    href: 'https://github.com/prettier/prettier/tree/master'
  })
})

test('https://github.com/akhodakivskiy/VimFx', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/akhodakivskiy/VimFx'), {
    user: 'akhodakivskiy',
    repo: 'VimFx',
    branch: 'master',
    href: 'https://github.com/akhodakivskiy/VimFx/tree/master'
  })
})

test('https://github.com/sindresorhus/pageres/commit/663be15acb3dd2eb0f71b1956ef28c2cd3fdeed0', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/sindresorhus/pageres/commit/663be15acb3dd2eb0f71b1956ef28c2cd3fdeed0'), {
    user: 'sindresorhus',
    repo: 'pageres'
  })
})

test('https://github.com/mozilla/web-ext/releases/new', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/mozilla/web-ext/releases/new'), {
    user: 'mozilla',
    repo: 'web-ext'
  })
})

test('https://github.com/mozilla/web-ext/issues?utf8=%E2%9C%93&q=is%3Aclosed%20label%3A%22needs%3A%20docs%22%20', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/mozilla/web-ext/issues?utf8=%E2%9C%93&q=is%3Aclosed%20label%3A%22needs%3A%20docs%22%20'), {
    user: 'mozilla',
    repo: 'web-ext'
  })
})

test('https://github.com/x0rz/EQGRP/edit/master/README.md', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/x0rz/EQGRP/edit/master/README.md'), {
    user: 'x0rz',
    repo: 'EQGRP'
  })
})

test('https://github.com/gorhill/uBlock/graphs/contributors', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/gorhill/uBlock/graphs/contributors'), {
    user: 'gorhill',
    repo: 'uBlock'
  })
})

/* eslint-disable id-length, no-shadow */
import test from 'ava';
import userRepoBranch from '../lib/user-repo-branch';

test('https://github.com/akhodakivskiy/VimFx', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/akhodakivskiy/VimFx'), {
    user: 'akhodakivskiy',
    repo: 'VimFx',
    branch: 'master',
    href: 'https://github.com/akhodakivskiy/VimFx/tree/master',
  });
});

test('https://github.com/sindresorhus/pageres/commit/663be15acb3dd2eb0f71b1956ef28c2cd3fdeed0', (t) => {
  t.deepEqual(userRepoBranch('https://github.com/sindresorhus/pageres/commit/663be15acb3dd2eb0f71b1956ef28c2cd3fdeed0'), {
    user: 'sindresorhus',
    repo: 'pageres',
  });
});

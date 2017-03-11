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

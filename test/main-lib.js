/* eslint-disable id-length, no-shadow */
import test from 'tape';
import jsdom from 'jsdom';
import permalink from '../lib/permalinker';

require('dotenv-safe').config();

test('permalinker', (t) => {
  t.test('https://github.com/isaacs/github/issues/625#issuecomment-203464167', (t) => {
    t.plan(2);

    jsdom.env('https://github.com/isaacs/github/issues/625#issuecomment-203464167', (err, { document }) => {
      t.ifError(err);

      permalink({ token: process.env.GITHUB_TOKEN }, document).then(() => {
        t.equal(document.querySelector('[href="https://github.com/andrewthad/yesod-table/blob/master/src/Yesod/Table.hs"]').nextElementSibling.href,
          'https://github.com/andrewthad/yesod-table/blob/57a2b5b385612d67f76f19d5c6164e182dee4fcf/src/Yesod/Table.hs');
      });
    });
  });
});

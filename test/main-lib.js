/* eslint-disable id-length, no-shadow */
import test from 'tape';
import jsdom from 'jsdom';
import permalink from '../lib/permalinker';

require('dotenv-safe').config();

test('permalinker', (t) => {
  checkLink(t, 'https://github.com/isaacs/github/issues/625#issuecomment-203464167',
    'https://github.com/andrewthad/yesod-table/blob/master/src/Yesod/Table.hs',
    'https://github.com/andrewthad/yesod-table/blob/57a2b5b385612d67f76f19d5c6164e182dee4fcf/src/Yesod/Table.hs',
  );

  checkLink(t, 'https://github.com/thoughtbot/dotfiles/pull/513#discussion_r101161729',
    'https://github.com/thoughtbot/dotfiles/blob/master/rcrc#L2',
    'https://github.com/thoughtbot/dotfiles/blob/2fa36ccf9dab57597dc3296381474641a5cbd813/rcrc#L2',
  );
});

function checkLink(t, pageUrl, linkHref, permalinkHref) {
  t.test(pageUrl, (t) => {
    t.plan(3);

    jsdom.env(pageUrl, (err, { document }) => {
      t.ifError(err);

      permalink({ token: process.env.GITHUB_TOKEN }, document).then(() => {
        const fragileLink = document.querySelector(`[href="${linkHref}"]`);
        t.equal(fragileLink.nextSibling.textContent.length, 2); // can't seem to check for ' ('
        t.equal(fragileLink.nextElementSibling.href, permalinkHref);
      });
    });
  });
}

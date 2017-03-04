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

  checkLink(t, 'https://github.com/OctoLinker/browser-extension/issues/113#issue-163053327',
    'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
    'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
  );

  checkLink(t, 'https://gist.github.com/HaNdTriX/77916f3fcdd7d285f7c9#what-i-already-got',
    'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/master/app/templates/tasks/compress.js',
    'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/780d02c18433983d8dd13ebc0b2d3ef9b7beaf06/app/templates/tasks/compress.js',
  );
});

function checkLink(t, pageUrl, linkHref, permalinkHref) {
  t.test(pageUrl, (t) => {
    t.plan(5);

    jsdom.env(pageUrl, async (err, { document }) => {
      t.ifError(err, 'created DOM');

      await permalink({ token: process.env.GITHUB_TOKEN }, document);
      const fragileLink = document.querySelector(`[href="${linkHref}"]`);
      t.equal(fragileLink.title, linkHref, 'set fragile link title');
      if (permalinkHref !== linkHref) {
        // a permalink should have been inserted
        t.equal(fragileLink.nextSibling.textContent.length, 2, 'text separator present'); // can't seem to check for ' ('
        t.equal(fragileLink.nextElementSibling.href, permalinkHref, 'href is permalink');
        t.equal(fragileLink.nextElementSibling.firstChild.title, permalinkHref, 'title is permalink');
      } else if (fragileLink.nextElementSibling) {
        // a permalink should not have been inserted
        t.pass("skipping ' (' check since next link shouldn't be a permalink");
        t.notEqual(fragileLink.nextElementSibling.href, permalinkHref, 'href is not permalink');
        t.pass("skipping title check since next link shouldn't be a permalink");
      } else {
        // there no next link, so we're good
        t.pass("skipping ' (' check since there isn't a next link");
        t.pass("skipping href check since there isn't a next link");
        t.pass("skipping title check since there isn't a next link");
      }
    });
  });
}

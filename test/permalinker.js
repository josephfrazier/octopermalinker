/* eslint-disable id-length, no-shadow */
import test from 'tape';
import jsdom from 'jsdom';
import permalink from '../lib/permalinker';

require('dotenv-safe').config();

test('permalinker', (t) => {
  checkLink(t, 'issue comment',
    'https://github.com/isaacs/github/issues/625#issuecomment-203464167',
    'https://github.com/andrewthad/yesod-table/blob/master/src/Yesod/Table.hs',
    'https://github.com/andrewthad/yesod-table/blob/57a2b5b385612d67f76f19d5c6164e182dee4fcf/src/Yesod/Table.hs',
  );

  checkLink(t, 'PR review comment',
    'https://github.com/thoughtbot/dotfiles/pull/513#discussion_r101161729',
    'https://github.com/thoughtbot/dotfiles/blob/master/rcrc#L2',
    'https://github.com/thoughtbot/dotfiles/blob/2fa36ccf9dab57597dc3296381474641a5cbd813/rcrc#L2',
  );

  checkLink(t, 'already permalink',
    'https://github.com/OctoLinker/browser-extension/issues/113#issue-163053327',
    'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
    'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
  );

  checkLink(t, 'gist',
    'https://gist.github.com/HaNdTriX/77916f3fcdd7d285f7c9#what-i-already-got',
    'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/master/app/templates/tasks/compress.js',
    'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/780d02c18433983d8dd13ebc0b2d3ef9b7beaf06/app/templates/tasks/compress.js',
  );

  checkLink(t, 'markdown blob',
    'https://github.com/docker/engine-api/blob/4290f40c056686fcaa5c9caf02eac1dde9315adf/README.md#deprecated',
    'https://github.com/docker/docker/tree/master/client',
    'https://github.com/docker/docker/tree/fdce2a7775ec80d769f585c0a400c6cf6615776b/client',
  );

  checkLink(t, 'markdown internal link',
    'https://github.com/docker/engine-api/tree/4290f40c056686fcaa5c9caf02eac1dde9315adf',
    '#deprecated',
    '#deprecated',
  );

  checkLink(t, 'badge',
    'https://github.com/kentcdodds/cross-env/tree/b59473a62777c6e03c3fe60e685a20df8e63c3f9#cross-env',
    'https://github.com/kentcdodds/cross-env/blob/master/other/LICENSE',
    'https://github.com/kentcdodds/cross-env/blob/b59473a62777c6e03c3fe60e685a20df8e63c3f9/other/LICENSE',
    false,
  );

  checkLink(t, 'fall back to master branch',
    'https://github.com/mikechabot/cross-env-example/pull/1#issue-139341424',
    'https://github.com/kentcdodds/cross-env#known-limitations',
    'https://github.com/kentcdodds/cross-env/tree/20d35cd6c16961c7205273b7214c3c6de0ed5497#known-limitations',
  );

  checkLink(t, 'do not permalink issue comment self-links',
    'https://github.com/mikechabot/cross-env-example/pull/1#issue-139341424',
    '#issue-139341424',
    'https://github.com/mikechabot/cross-env-example/pull/1/tree/8c08f73f4b7faf0911320da5ec06f918651740f8#issue-139341424',
    false,
  );

  checkLink(t, 'gist comments',
    'https://gist.github.com/nicwolff/1663989/f7e7761a1cad124d5aa5fdf17be43b4249e5b529#gistcomment-616611',
    'https://github.com/git/git/tree/master/contrib/completion',
    'https://github.com/git/git/tree/fb4c62235fee8008d99ef55c4adcb1f7ea9508a3/contrib/completion',
  );
});

function checkLink(t, name, pageUrl, linkHref, permalinkHref, shouldPermalink = true) {
  t.test(name, (t) => {
    t.plan(6);

    jsdom.env(pageUrl, async (err, { document }) => {
      t.ifError(err, `loaded ${pageUrl}`);

      await permalink({ token: process.env.GITHUB_TOKEN }, document);
      const fragileLink = document.querySelector(`[href="${linkHref}"]`);
      if (shouldPermalink && permalinkHref !== linkHref) {
        // a permalink should have been inserted
        t.equal(fragileLink.title, linkHref, 'set fragile link title');
        t.equal(fragileLink.nextSibling.textContent.length, 2, 'text separator present'); // can't seem to check for ' ('
        t.equal(fragileLink.nextElementSibling.href, permalinkHref, 'href is permalink');
        t.equal(fragileLink.nextElementSibling.title, permalinkHref, 'title is permalink');
        t.equal(fragileLink.nextElementSibling.lastChild.title, permalinkHref, 'title is permalink');
      } else if (fragileLink.nextElementSibling) {
        // a permalink should not have been inserted
        t.pass("skipping fragile link title check since next link shouldn't be a permalink");
        t.pass("skipping ' (' check since next link shouldn't be a permalink");
        t.notOk(fragileLink.nextElementSibling.href === permalinkHref, `${fragileLink.nextElementSibling.href} === ${permalinkHref}`);
        t.pass("skipping permalink title check since next link shouldn't be a permalink");
        t.pass("skipping permalink title check since next link shouldn't be a permalink");
      } else {
        // there no next link, so we're good
        t.pass("skipping fragile link title check since there isn't a next link");
        t.pass("skipping ' (' check since there isn't a next link");
        t.pass("skipping href check since there isn't a next link");
        t.pass("skipping permalink title check since there isn't a next link");
        t.pass("skipping permalink title check since there isn't a next link");
      }
    });
  });
}

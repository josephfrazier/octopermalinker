/* eslint-disable id-length, no-shadow */
import test from 'ava';
import pify from 'pify';
import jsdom from 'jsdom';
import permalink from '../lib/permalinker';

require('dotenv-safe').config();

checkLink('issue comment',
  'https://github.com/isaacs/github/issues/625#issuecomment-203464167',
  'https://web.archive.org/web/20170310233459id_/https://github.com/isaacs/github/issues/625',
  'https://github.com/andrewthad/yesod-table/blob/master/src/Yesod/Table.hs',
  'https://github.com/andrewthad/yesod-table/blob/57a2b5b385612d67f76f19d5c6164e182dee4fcf/src/Yesod/Table.hs',
);

checkLink('PR review comment',
  'https://github.com/thoughtbot/dotfiles/pull/513#discussion_r101161729',
  'https://web.archive.org/web/20170310233633id_/https://github.com/thoughtbot/dotfiles/pull/513',
  'https://github.com/thoughtbot/dotfiles/blob/master/rcrc#L2',
  'https://github.com/thoughtbot/dotfiles/blob/2fa36ccf9dab57597dc3296381474641a5cbd813/rcrc#L2',
);

checkLink('already permalink',
  'https://github.com/OctoLinker/browser-extension/issues/113#issue-163053327',
  'https://web.archive.org/web/20170310233609id_/https://github.com/OctoLinker/browser-extension/issues/113',
  'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
  'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
);

checkLink('gist',
  'https://gist.github.com/HaNdTriX/77916f3fcdd7d285f7c9#what-i-already-got',
  'https://web.archive.org/web/20170310233604id_/https://gist.github.com/HaNdTriX/77916f3fcdd7d285f7c9',
  'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/master/app/templates/tasks/compress.js',
  'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/780d02c18433983d8dd13ebc0b2d3ef9b7beaf06/app/templates/tasks/compress.js',
);

checkLink('markdown blob',
  'https://github.com/docker/engine-api/blob/4290f40c056686fcaa5c9caf02eac1dde9315adf/README.md#deprecated',
  'https://web.archive.org/web/20170310233559id_/https://github.com/docker/engine-api/blob/4290f40c056686fcaa5c9caf02eac1dde9315adf/README.md',
  'https://github.com/docker/docker/tree/master/client',
  'https://github.com/docker/docker/tree/fdce2a7775ec80d769f585c0a400c6cf6615776b/client',
);

checkLink('markdown internal link',
  'https://github.com/docker/engine-api/tree/4290f40c056686fcaa5c9caf02eac1dde9315adf',
  'https://web.archive.org/web/20170310233555id_/https://github.com/docker/engine-api/tree/4290f40c056686fcaa5c9caf02eac1dde9315adf',
  '#deprecated',
  '#deprecated',
);

checkLink('badge',
  'https://github.com/kentcdodds/cross-env/tree/b59473a62777c6e03c3fe60e685a20df8e63c3f9#cross-env',
  'https://web.archive.org/web/20170310233550id_/https://github.com/kentcdodds/cross-env/tree/b59473a62777c6e03c3fe60e685a20df8e63c3f9',
  'https://github.com/kentcdodds/cross-env/blob/master/other/LICENSE',
  'https://github.com/kentcdodds/cross-env/blob/b59473a62777c6e03c3fe60e685a20df8e63c3f9/other/LICENSE',
  false,
);

checkLink('fall back to master branch',
  'https://github.com/mikechabot/cross-env-example/pull/1#issue-139341424',
  'https://web.archive.org/web/20170310233547id_/https://github.com/mikechabot/cross-env-example/pull/1',
  'https://github.com/kentcdodds/cross-env#known-limitations',
  'https://github.com/kentcdodds/cross-env/tree/20d35cd6c16961c7205273b7214c3c6de0ed5497#known-limitations',
);

checkLink('do not permalink issue comment self-links',
  'https://github.com/mikechabot/cross-env-example/pull/1#issue-139341424',
  'https://web.archive.org/web/20170310233547id_/https://github.com/mikechabot/cross-env-example/pull/1',
  '#issue-139341424',
  'https://github.com/mikechabot/cross-env-example/pull/1/tree/8c08f73f4b7faf0911320da5ec06f918651740f8#issue-139341424',
  false,
);

checkLink('gist comments',
  'https://gist.github.com/nicwolff/1663989/f7e7761a1cad124d5aa5fdf17be43b4249e5b529#gistcomment-616611',
  'https://web.archive.org/web/20170310233547id_/https://gist.github.com/nicwolff/1663989/f7e7761a1cad124d5aa5fdf17be43b4249e5b529',
  'https://github.com/git/git/tree/master/contrib/completion',
  'https://github.com/git/git/tree/fb4c62235fee8008d99ef55c4adcb1f7ea9508a3/contrib/completion',
);

function checkLink(name, pageUrl, archiveUrl, linkHref, permalinkHref, shouldPermalink = true) {
  test(`${name}: ${pageUrl}`, async (t) => {
    const { document } = await pify(jsdom.env)(archiveUrl);
    await permalink({ token: process.env.GITHUB_TOKEN }, document);
    const fragileLink = document.querySelector(`[href="${linkHref}"]`);
    if (shouldPermalink && permalinkHref !== linkHref) {
      // a permalink should have been inserted
      t.is(fragileLink.title, linkHref, 'set fragile link title');
      t.is(fragileLink.nextSibling.textContent.length, 2, 'text separator present'); // can't seem to check for ' ('
      t.is(fragileLink.nextElementSibling.href, permalinkHref, 'href is permalink');
      t.is(fragileLink.nextElementSibling.title, permalinkHref, 'title is permalink');
      t.is(fragileLink.nextElementSibling.lastChild.title, permalinkHref, 'title is permalink');
    } else if (fragileLink.nextElementSibling) {
      // a permalink should not have been inserted
      t.falsy(fragileLink.nextElementSibling.href === permalinkHref, `${fragileLink.nextElementSibling.href} === ${permalinkHref}`);
    } // else, there no next link, so we're good
  });
}

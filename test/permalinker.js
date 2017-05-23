/* eslint-disable id-length, no-shadow */
import test from 'ava'
import fse from 'fs-extra'
import pify from 'pify'
import got from 'got'
import { JSDOM } from 'jsdom'
import permalink from '../lib/permalinker'

require('dotenv-safe').config()

checkLink({
  name: 'eslump readme',
  pageUrl: 'https://github.com/lydell/eslump#examples',
  archiveUrl: 'https://web.archive.org/web/20170413182903id_/https://github.com/lydell/eslump#examples',
  linkHref: 'https://github.com/prettier/prettier/',
  permalinkHref: 'https://github.com/prettier/prettier/tree/7702a2b1e30118471b00f7ba4ca4f47450c54ebb'
})

checkLink({
  name: 'milestones url',
  pageUrl: 'https://github.com/slevithan/xregexp/issues/108#issuecomment-293076389',
  archiveUrl: 'https://web.archive.org/web/20170410213100id_/https://github.com/slevithan/xregexp/issues/108#issuecomment-293076389',
  linkHref: 'https://github.com/slevithan/xregexp/milestones',
  permalinkHref: 'https://github.com/slevithan/xregexp/milestones/tree/a5e5f43a65c17547cb7be7c2859d1022f2bcbc7f',
  shouldPermalink: false
})

checkLink({
  name: 'search links',
  pageUrl: 'https://github.com/moll/vim-node/issues/24#issuecomment-132334681',
  archiveUrl: 'https://web.archive.org/web/20170322175057id_/https://github.com/moll/vim-node/issues/24#issuecomment-132334681',
  linkHref: 'https://github.com/moll/vim-node/search?utf8=%E2%9C%93&q=node_modules',
  permalinkHref: 'https://github.com/moll/vim-node/search/tree/e02ea6e4d9acab19fb7f598be08e5eec5d239999',
  shouldPermalink: false
})

checkLink({
  name: 'issue comment',
  pageUrl: 'https://github.com/isaacs/github/issues/625#issuecomment-203464167',
  archiveUrl: 'https://web.archive.org/web/20170310233459id_/https://github.com/isaacs/github/issues/625',
  linkHref: 'https://github.com/andrewthad/yesod-table/blob/master/src/Yesod/Table.hs',
  permalinkHref: 'https://github.com/andrewthad/yesod-table/blob/57a2b5b385612d67f76f19d5c6164e182dee4fcf/src/Yesod/Table.hs'
})

checkLink({
  name: 'PR review comment',
  pageUrl: 'https://github.com/thoughtbot/dotfiles/pull/513#discussion_r101161729',
  archiveUrl: 'https://web.archive.org/web/20170310233633id_/https://github.com/thoughtbot/dotfiles/pull/513',
  linkHref: 'https://github.com/thoughtbot/dotfiles/blob/master/rcrc#L2',
  permalinkHref: 'https://github.com/thoughtbot/dotfiles/blob/2fa36ccf9dab57597dc3296381474641a5cbd813/rcrc#L2'
})

checkLink({
  name: 'already permalink',
  pageUrl: 'https://github.com/OctoLinker/browser-extension/issues/113#issue-163053327',
  archiveUrl: 'https://web.archive.org/web/20170310233609id_/https://github.com/OctoLinker/browser-extension/issues/113',
  linkHref: 'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61',
  permalinkHref: 'https://github.com/OctoLinker/browser-extension/blob/71ae1d68526919bee2c6e8339a1cd87b5febff11/lib/click-handler.js#L54-L61'
})

checkLink({
  name: 'gist',
  pageUrl: 'https://gist.github.com/HaNdTriX/77916f3fcdd7d285f7c9#what-i-already-got',
  archiveUrl: 'https://web.archive.org/web/20170310233604id_/https://gist.github.com/HaNdTriX/77916f3fcdd7d285f7c9',
  linkHref: 'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/master/app/templates/tasks/compress.js',
  permalinkHref: 'https://github.com/HaNdTriX/generator-chrome-extension-kickstart/blob/780d02c18433983d8dd13ebc0b2d3ef9b7beaf06/app/templates/tasks/compress.js'
})

checkLink({
  name: 'markdown blob',
  pageUrl: 'https://github.com/docker/engine-api/blob/4290f40c056686fcaa5c9caf02eac1dde9315adf/README.md#deprecated',
  archiveUrl: 'https://web.archive.org/web/20170310233559id_/https://github.com/docker/engine-api/blob/4290f40c056686fcaa5c9caf02eac1dde9315adf/README.md',
  linkHref: 'https://github.com/docker/docker/tree/master/client',
  permalinkHref: 'https://github.com/docker/docker/tree/fdce2a7775ec80d769f585c0a400c6cf6615776b/client'
})

checkLink({
  name: 'markdown internal link',
  pageUrl: 'https://github.com/docker/engine-api/tree/4290f40c056686fcaa5c9caf02eac1dde9315adf',
  archiveUrl: 'https://web.archive.org/web/20170310233555id_/https://github.com/docker/engine-api/tree/4290f40c056686fcaa5c9caf02eac1dde9315adf',
  linkHref: '#deprecated',
  permalinkHref: '#deprecated'
})

checkLink({
  name: 'badge',
  pageUrl: 'https://github.com/kentcdodds/cross-env/tree/b59473a62777c6e03c3fe60e685a20df8e63c3f9#cross-env',
  archiveUrl: 'https://web.archive.org/web/20170310233550id_/https://github.com/kentcdodds/cross-env/tree/b59473a62777c6e03c3fe60e685a20df8e63c3f9',
  linkHref: 'https://github.com/kentcdodds/cross-env/blob/master/other/LICENSE',
  permalinkHref: 'https://github.com/kentcdodds/cross-env/blob/b59473a62777c6e03c3fe60e685a20df8e63c3f9/other/LICENSE',
  shouldPermalink: false
})

checkLink({
  name: 'fall back to master branch',
  pageUrl: 'https://github.com/mikechabot/cross-env-example/pull/1#issue-139341424',
  archiveUrl: 'https://web.archive.org/web/20170310233547id_/https://github.com/mikechabot/cross-env-example/pull/1',
  linkHref: 'https://github.com/kentcdodds/cross-env#known-limitations',
  permalinkHref: 'https://github.com/kentcdodds/cross-env/tree/20d35cd6c16961c7205273b7214c3c6de0ed5497#known-limitations'
})

checkLink({
  name: 'do not permalink issue comment self-links',
  pageUrl: 'https://github.com/mikechabot/cross-env-example/pull/1#issue-139341424',
  archiveUrl: 'https://web.archive.org/web/20170310233547id_/https://github.com/mikechabot/cross-env-example/pull/1',
  linkHref: '#issue-139341424',
  permalinkHref: 'https://github.com/mikechabot/cross-env-example/pull/1/tree/8c08f73f4b7faf0911320da5ec06f918651740f8#issue-139341424',
  shouldPermalink: false
})

checkLink({
  name: 'gist comments',
  pageUrl: 'https://gist.github.com/nicwolff/1663989/f7e7761a1cad124d5aa5fdf17be43b4249e5b529#gistcomment-616611',
  archiveUrl: 'https://web.archive.org/web/20170310233547id_/https://gist.github.com/nicwolff/1663989/f7e7761a1cad124d5aa5fdf17be43b4249e5b529',
  linkHref: 'https://github.com/git/git/tree/master/contrib/completion',
  permalinkHref: 'https://github.com/git/git/tree/fb4c62235fee8008d99ef55c4adcb1f7ea9508a3/contrib/completion'
})

function checkLink ({ name, pageUrl, archiveUrl, linkHref, permalinkHref, shouldPermalink = true }) {
  test(`${name}: ${pageUrl}`, async (t) => {
    const fixturePath = `${__dirname}/fixtures/${name.replace(/ /g, '_')}/page.html`
    if (!fse.existsSync(fixturePath)) {
      const { body } = await got(archiveUrl)
      await pify(fse.outputFile)(fixturePath, body)
    }
    const { window: { document } } = await JSDOM.fromFile(fixturePath)
    await permalink({ token: process.env.GITHUB_TOKEN }, document)
    const fragileLink = document.querySelector(`[href="${linkHref}"]`)
    if (shouldPermalink && permalinkHref !== linkHref) {
      // a permalink should have been inserted
      t.is(fragileLink.title, linkHref, 'set fragile link title')
      t.is(fragileLink.nextSibling.textContent.length, 2, 'text separator present') // can't seem to check for ' ('
      t.is(fragileLink.nextElementSibling.href, permalinkHref, 'href is permalink')
      t.is(fragileLink.nextElementSibling.title, permalinkHref, 'title is permalink')
      t.is(fragileLink.nextElementSibling.lastChild.title, permalinkHref, 'title is permalink')
    } else if (fragileLink.nextElementSibling) {
      // a permalink should not have been inserted
      t.falsy(fragileLink.nextElementSibling.href === permalinkHref, `${fragileLink.nextElementSibling.href} === ${permalinkHref}`)
    } else {
      t.pass('a permalink should not have been inserted, and there was no next link')
    }
  })
}

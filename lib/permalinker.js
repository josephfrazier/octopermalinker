import { parse } from 'url';
import GitHub from 'github-api';
import concatMap from 'concat-map';
import domify from 'domify';
import userRepoBranch from './user-repo-branch';

/*
* for each comment on the page (limit to issues/pulls?)
  * get the datetime attribute <relative-time> of the comment
  * for each link in the comment
    * skip if the link is not to a branch (check this with a github url parser)
    * Get the latest commit on the branch before the datetime, using https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
    * append link with the commit hash instead of the branch name
*/

export default async (githubOptions = {}, document = global.document) => {
  const githubApi = new GitHub(githubOptions);

  setupPasteListeners({ githubApi, document });

  const roots = await getRootsAndDateTimes({ githubApi, document });

  return Promise.all(concatMap(roots, ({ rootEl, datetime }) =>
    getBranchLinks(rootEl).map(async (anchor) => {
      try {
        const permalink = await getPermalink({ githubApi, href: anchor.href, datetime });
        insertPermalink({ document, anchor, permalink, datetime });
      } catch (err) {
        // eslint-disable-line no-empty
      }
    }),
  ));
};

function getMetaProperty(document, propertyName) {
  return document.querySelector(`meta[property="${propertyName}"]`).getAttribute('content');
}

function setupPasteListeners({ githubApi, document }) {
  const textareas = selectAll(document, 'textarea');

  textareas.forEach((field) => {
    const attrName = 'data-octopermalinker-paste-listener';
    if (field.getAttribute(attrName)) {
      return;
    }
    field.setAttribute(attrName, 'true');

    field.addEventListener('paste', pasteListener, false);
  });

  async function pasteListener(event) {
    // https://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718j
    const href = event.clipboardData.getData('text');
    const now = (new Date()).toISOString();

    const permalink = await getPermalink({
      href,
      githubApi,
      datetime: now,
    });

    const message = "It looks like you just pasted a fragile link. Here's a permalink:";
    global.prompt(message, permalink);
  }
}

async function getRootsAndDateTimes({ githubApi, document }) {
  let roots = [];

  const isGist = getMetaProperty(document, 'og:site_name') === 'Gist';
  if (isGist) {
    roots = await getGistFilesAndDatetimes({ githubApi, document });
    roots = roots.concat(getCommentsAndDatetimes(document));
  } else {
    roots = getCommentsAndDatetimes(document);
    if (roots.length === 0) {
      roots = getMarkdownBodiesAndDatetimes(document);
    }
  }

  return roots;
}

async function getGistFilesAndDatetimes({ githubApi, document }) {
  const location = parse(getMetaProperty(document, 'og:url'));
  const gistId = location.pathname.split('/')[2];

  // copied from https://github.com/github-tools/github/blob/46dd1d7c20b6fa686c47d4219a1aff0ca53e6ea0/lib/Gist.js#L118
  // TODO use listCommits instead of _requestAllPages once this is resolved:
  // https://github.com/github-tools/github/issues/436
  //
  // docs: https://developer.github.com/v3/gists/#list-gist-commits
  // example output: https://api.github.com/gists/77916f3fcdd7d285f7c9/commits
  const response = await githubApi.getGist(gistId)._requestAllPages(`/gists/${gistId}/commits`);
  const commits = response.data;
  const commit = commits[0];
  const datetime = commit.committed_at;

  return selectAll(document, '.file-box').map(file => ({
    rootEl: file,
    datetime,
  }));
}

const selectAll = (element, selector) => Array.from(element.querySelectorAll(selector));
const pluck = key => obj => obj[key];

function getCommentsAndDatetimes(document) {
  const parentSelectors = ['.comment', '.review-comment-contents'];
  return concatMap(parentSelectors, selector =>
    selectAll(document, selector).map(rootEl => ({
      rootEl,
      datetimeEl: rootEl.querySelector('relative-time'),
    })).filter(pluck('datetimeEl')).map(({ rootEl, datetimeEl }) => ({
      rootEl,
      datetime: datetimeEl.getAttribute('datetime'),
    })),
  );
}

function getMarkdownBodiesAndDatetimes(document) {
  const datetime = document.querySelector('.repository-content relative-time').getAttribute('datetime');
  return selectAll(document, '.markdown-body').map(rootEl => ({
    rootEl,
    datetime,
  }));
}

function getBranchLinks(rootEl) {
  return selectAll(rootEl, 'a')
    .filter(anchor => anchor.getAttribute('aria-hidden') !== 'true')
    .filter(anchor => !anchorIsBadge(anchor))
  ;
}

function anchorIsBadge(anchor) {
  return anchor.firstChild === anchor.lastChild
    && anchor.firstChild.tagName === 'IMG';
}

async function getPermalink({ githubApi, href, datetime }) {
  const githubInfo = userRepoBranch(href);
  const { user, repo, branch } = githubInfo;
  href = githubInfo.href;

  if (!branch || isCommitHash(branch)) {
    throw Error('href does not have a branch, or is to a commit hash');
  }

  const response = await githubApi.getRepo(user, repo).listCommits({ branch, until: datetime });
  const commits = response.data;
  const commit = commits[0];
  const sha = commit.sha;

  return href.replace(branch, sha);
}

function isCommitHash(branch) {
  // If the "branch" name is all hexadecimal, and at least 7 characters long,
  // it's probably actually a commit hash.
  // TODO use github api instead of pattern matching
  return /^[a-f0-9]{7,}$/.test(branch);
}

function insertPermalink({ document, anchor, permalink, datetime }) {
  if (!anchor.title) {
    anchor.title = anchor.href;
  }
  if (anchor.nextElementSibling && anchor.nextElementSibling.href === permalink) {
    return;
  }
  const imageUrl = global.chrome ? chrome.extension.getURL('link-icon.png') : ''; // tests don't have global.chrome
  const image = `<img style="height: .8em; vertical-align: middle;" src="${imageUrl}" />`;
  const relativeTime = `<relative-time datetime="${datetime}" title="${permalink}">at ${datetime}</relative-time>`;
  const permaAnchor = `<a href="${permalink}" title="${permalink}">${image} ${relativeTime}</a>`;
  insertAfter(domify(`&nbsp;(${permaAnchor}) `, document), anchor);
}

function insertAfter(node, ref) {
  ref.parentNode.insertBefore(node, ref.nextSibling);
}

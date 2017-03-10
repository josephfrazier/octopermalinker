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

  let roots = [];

  if (document.location.host === 'gist.github.com') {
    roots = await getGistFilesAndDatetimes({ githubApi, document });
    roots = roots.concat(getCommentsAndDatetimes(document));
  } else {
    roots = getCommentsAndDatetimes(document);
    if (roots.length === 0) {
      roots = getMarkdownBodiesAndDatetimes(document);
    }
  }

  return Promise.all(concatMap(roots, ({ rootEl, datetime }) =>
    getBranchLinks(rootEl).map(async ({ anchor, href, user, repo, branch }) => {
      try {
        const sha = await mostRecentCommit({ githubApi, user, repo, branch, until: datetime });
        insertPermalink({ document, anchor, href, branch, sha, datetime });
      } catch (err) {
        console.error(err.message); // eslint-disable-line no-console
      }
    }),
  ));
};

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
    const content = event.clipboardData.getData('text');
    const githubInfo = userRepoBranch(content);
    const { branch, href } = githubInfo;

    if (!branch || isCommitHash(branch)) {
      return;
    }

    const now = (new Date()).toISOString();

    const sha = await mostRecentCommit({
      ...githubInfo,
      githubApi,
      until: now,
    });

    const message = "It looks like you just pasted a fragile link. Here's a permalink:";
    const permalink = href.replace(branch, sha);
    global.prompt(message, permalink);
  }
}

async function getGistFilesAndDatetimes({ githubApi, document }) {
  const gistId = document.location.pathname.split('/')[2];

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
  return selectAll(rootEl, 'a').map(anchor => ({
    anchor,
    ...userRepoBranch(anchor.href),
  }))
    .filter(pluck('branch'))
    .filter(({ anchor }) => anchor.getAttribute('aria-hidden') !== 'true')
    .filter(({ anchor }) => !anchorIsBadge(anchor))
  ;
}

function anchorIsBadge(anchor) {
  return anchor.firstChild === anchor.lastChild
    && anchor.firstChild.tagName === 'IMG';
}

async function mostRecentCommit({ githubApi, user, repo, branch, until }) {
  if (isCommitHash(branch)) {
    return branch;
  }

  const response = await githubApi.getRepo(user, repo).listCommits({ branch, until });
  const commits = response.data;
  const commit = commits[0];
  const sha = commit.sha;

  return sha;
}

function isCommitHash(branch) {
  // If the "branch" name is all hexadecimal, and at least 7 characters long,
  // it's probably actually a commit hash.
  // TODO use github api instead of pattern matching
  return /^[a-f0-9]{7,}$/.test(branch);
}

function insertPermalink({ document, anchor, href, branch, sha, datetime }) {
  if (!anchor.title) {
    anchor.title = anchor.href;
  }
  if (sha === branch) {
    return;
  }
  const permalink = href.replace(branch, sha);
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

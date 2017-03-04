import githubUrl from 'github-url-to-object';
import GitHub from 'github-api';
import concatMap from 'concat-map';
import domify from 'domify';

/*
* for each comment on the page (limit to issues/pulls?)
  * get the datetime attribute <relative-time> of the comment
  * for each link in the comment
    * skip if the link is not to a branch (check this with a github url parser)
    * Get the latest commit on the branch before the datetime, using https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
    * append link with the commit hash instead of the branch name
*/

export default (githubOptions = {}, document = global.document) => {
  const gh = new GitHub(githubOptions);

  let rootsPromise = [];

  if (document.location.host === 'gist.github.com') {
    rootsPromise = getGistFilesAndDatetimes({ gh, document });
  } else {
    rootsPromise = getCommentsAndDatetimes(document);
  }

  return Promise.resolve(rootsPromise).then(roots => Promise.all(concatMap(roots, ({ rootEl, datetime }) =>
    getBranchLinks(rootEl).map(({ anchor, user, repo, branch }) =>
      mostRecentCommit({ gh, user, repo, branch, until: datetime }).then(sha =>
        insertPermalink({ document, anchor, branch, sha, datetime }),
      ),
    ),
  )));
};

function getGistFilesAndDatetimes({ gh, document }) {
  const gistId = document.location.pathname.split('/')[2];

  // copied from https://github.com/github-tools/github/blob/46dd1d7c20b6fa686c47d4219a1aff0ca53e6ea0/lib/Gist.js#L118
  // TODO use listCommits instead of _requestAllPages once this is resolved:
  // https://github.com/github-tools/github/issues/436
  //
  // docs: https://developer.github.com/v3/gists/#list-gist-commits
  // example output: https://api.github.com/gists/77916f3fcdd7d285f7c9/commits
  return gh.getGist(gistId)._requestAllPages(`/gists/${gistId}/commits`).then((response) => {
    const commits = response.data;
    const commit = commits[0];
    const datetime = commit.committed_at;

    return selectAll(document, '.file-box').map(file => ({
      rootEl: file,
      datetime,
    }));
  });
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

function getBranchLinks(rootEl) {
  return selectAll(rootEl, 'a').map(anchor => ({
    anchor,
    ...userRepoBranch(anchor.href),
  })).filter(pluck('branch'));
}

function userRepoBranch(href) {
  const githubInfo = githubUrl(href);

  if (!githubInfo) {
    return {};
  }

  const { user, repo } = githubInfo;

  // branch names can have slashes, but since they aren't escaped,
  // github-url-to-object can't tell where the branch name ends,
  // and it might include part of the path in the branch name,
  // so just assume the branch name doesn't have slashes
  const branch = githubInfo.branch.split('/')[0];

  // skip false positives like issue/pull urls
  if (!href.includes(branch)) {
    return { user, repo };
  }

  return {
    user,
    repo,
    branch,
  };
}

function mostRecentCommit({ gh, user, repo, branch, until }) {
  if (isCommitHash(branch)) {
    return Promise.resolve(branch);
  }

  return gh.getRepo(user, repo).listCommits({ branch, until }).then((response) => {
    const commits = response.data;
    const commit = commits[0];
    const sha = commit.sha;

    return sha;
  });
}

function isCommitHash(branch) {
  // If the "branch" name is all hexadecimal, and at least 7 characters long,
  // it's probably actually a commit hash.
  // TODO use github api instead of pattern matching
  return /^[a-f0-9]{7,}$/.test(branch);
}

function insertPermalink({ document, anchor, branch, sha, datetime }) {
  if (!anchor.title) {
    anchor.title = anchor.href;
  }
  if (sha === branch) {
    return;
  }
  const permalink = anchor.href.replace(branch, sha);
  if (anchor.nextElementSibling && anchor.nextElementSibling.href === permalink) {
    return;
  }
  const relativeTime = `<relative-time datetime="${datetime}" title="${permalink}">at ${datetime}</relative-time>`;
  const permaAnchor = `<a href="${permalink}">${relativeTime}</a>`;
  insertAfter(domify(`&nbsp;(${permaAnchor}) `, document), anchor);
}

function insertAfter(node, ref) {
  ref.parentNode.insertBefore(node, ref.nextSibling);
}

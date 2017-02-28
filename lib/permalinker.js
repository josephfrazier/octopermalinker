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

  const comments = getCommentsAndDatetimes(document);
  return Promise.all(concatMap(comments, ({ commentEl, datetime, humanTime }) =>
    getBranchLinks(commentEl).map(({ anchor, user, repo, branch }) =>
      mostRecentCommit({ gh, user, repo, branch, until: datetime }).then(sha =>
        insertPermalink({ document, anchor, branch, sha, humanTime }),
      ),
    ),
  ));
};

const selectAll = (element, selector) => Array.from(element.querySelectorAll(selector));
const pluck = key => obj => obj[key];

function getCommentsAndDatetimes(document) {
  const parentSelectors = ['.comment', '.review-comment-contents'];
  return concatMap(parentSelectors, selector =>
    selectAll(document, selector).map(commentEl => ({
      commentEl,
      datetimeEl: commentEl.querySelector('relative-time'),
    })).filter(pluck('datetimeEl')).map(({ commentEl, datetimeEl }) => ({
      commentEl,
      datetime: datetimeEl.getAttribute('datetime'),
      humanTime: datetimeEl.textContent,
    })),
  );
}

function getBranchLinks(commentEl) {
  return selectAll(commentEl, '.comment-body a').map(anchor => ({
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

function insertPermalink({ document, anchor, branch, sha, humanTime }) {
  if (sha === branch) {
    return;
  }
  const permalink = anchor.href.replace(branch, sha);
  insertAfter(domify(`&nbsp;(<a href=${permalink}>${humanTime}</a>) `, document), anchor);
}

function insertAfter(node, ref) {
  ref.parentNode.insertBefore(node, ref.nextSibling);
}

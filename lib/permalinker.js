import githubUrl from 'github-url-to-object';
import GitHub from 'github-api';
import concatMap from 'concat-map';

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

  const selectAll = (element, selector) => Array.from(element.querySelectorAll(selector));

  return Promise.all(concatMap(selectAll(document, '.comment'), (commentEl) => {
    const datetimeEl = commentEl.querySelector('relative-time');

    if (!datetimeEl) {
      return;
    }

    const datetime = datetimeEl.getAttribute('datetime');
    const humanTime = datetimeEl.textContent;

    return selectAll(commentEl, '.comment-body a').map((anchor) => {
      const href = anchor.href;

      const { user, repo, branch } = userRepoBranch(href);

      if (!branch) return;

      return gh.getRepo(user, repo).listCommits({ branch, until: datetime }).then((response) => {
        const commits = response.data;
        const commit = commits[0];
        const sha = commit.sha;

        const permalink = href.replace(branch, sha);
        const permaAnchor = document.createElement('a');
        permaAnchor.href = permalink;
        permaAnchor.textContent = humanTime;

        const insertAfter = (relativeNode, newNode) => relativeNode.parentNode.insertBefore(newNode, relativeNode.nextSibling);
        insertAfter(anchor, document.createTextNode(') '));
        insertAfter(anchor, permaAnchor);
        insertAfter(anchor, document.createTextNode(' ('));
      });
    });
  }));
};

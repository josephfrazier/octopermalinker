// test here https://github.com/isaacs/github/issues/848
import githubUrl from 'github-url-to-object';
import GitHub from 'github-api';

/*
* for each comment on the page (limit to issues/pulls?)
  * get the datetime attribute <relative-time> of the comment
  * for each link in the comment
    * skip if the link is not to a branch (check this with a github url parser like octolinker uses)
    * Get the latest commit on the branch before the datetime, using https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
    * append link with the commit hash instead of the branch name
*/

export default () => {
  // TODO Add OAuth
  // https://developer.github.com/v3/#rate-limiting
  const gh = new GitHub();

  const selectAll = (element, selector) => Array.from(element.querySelectorAll(selector))

  selectAll(document, '.comment').forEach((commentEl) => {
    const datetimeEl = commentEl.querySelector('relative-time');

    if (!datetimeEl) {
      return;
    }

    const datetime = datetimeEl.getAttribute('datetime');
    const humanTime = datetimeEl.innerText;

    selectAll(commentEl, '.comment-body a').forEach((anchor) => {
      const href = anchor.href;
      const githubInfo = githubUrl(href);

      if (!githubInfo) {
        return;
      }

      const {user, repo} = githubInfo;

      // branch names can have slashes, but since they aren't escaped,
      // github-url-to-object can't tell where the branch name ends,
      // and it might include part of the path in the branch name,
      // so just assume the branch name doesn't have slashes
      const branch = githubInfo.branch.split('/')[0];

      // skip false positives like issue/pull urls
      if (!href.includes(branch)) {
        return;
      }

      gh.getRepo(user, repo).listCommits({branch, until: datetime}).then((response) => {
        const commits = response.data;
        const commit = commits[0];
        const sha = commit.sha;

        const permalink = href.replace(branch, sha);
        const permaAnchor = document.createElement('a');
        permaAnchor.href = permalink;
        permaAnchor.innerText = humanTime;

        const insertAfter = (relativeNode, newNode) => relativeNode.parentNode.insertBefore(newNode, relativeNode.nextSibling);
        insertAfter(anchor, document.createTextNode(`) `));
        insertAfter(anchor, permaAnchor);
        insertAfter(anchor, document.createTextNode(' ('));
      });
    });
  });
};

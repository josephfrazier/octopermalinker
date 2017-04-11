import { parse, resolve } from 'url'
import githubUrl from 'github-url-to-object'

export default function userRepoBranch (href) {
  const githubInfo = githubUrl(href)

  if (!githubInfo) {
    return {}
  }

  const { user, repo } = githubInfo

  // branch names can have slashes, but since they aren't escaped,
  // github-url-to-object can't tell where the branch name ends,
  // and it might include part of the path in the branch name,
  // so just assume the branch name doesn't have slashes
  const branch = githubInfo.branch.split('/')[0]

  // skip false positives like issue/pull urls
  if (!href.includes(branch)) {
    if (branch !== 'master' || isIssueUrl(href, user, repo)) {
      return { user, repo }
    }
    href = assumeBranch(href, 'master')
  }

  return {
    user,
    repo,
    branch,
    href
  }
}

function isIssueUrl (href, user, repo) {
  const isIssue = href.includes(`${user}/${repo}/issues`)
  const isPull = href.includes(`${user}/${repo}/pull/`)
  const isCommit = href.includes(`${user}/${repo}/commit/`)
  const isSearch = href.includes(`${user}/${repo}/search?`)
  const isMilestones = href.includes(`${user}/${repo}/milestones`)
  return isIssue || isPull || isCommit || isSearch || isMilestones
}

function assumeBranch (href, branch) {
  const { pathname, hash } = parse(href)
  const last = pathname.split('/').slice(-1)
  return resolve(href, `${last}/tree/${branch}${hash || ''}`)
}

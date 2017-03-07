TODO
====

* permlink gist comments: https://gist.github.com/nicwolff/1663989#gistcomment-616611
  * note that getCommentsAndDatetimes isn't called alongside getGistFilesAndDatetimes
  * async/await will make this easier
* permalink urls in code blobs: https://github.com/MatAtBread/fast-async/blob/fbd2c4db54813b5130f49a46f6280bcad17c7f53/plugin.js#L35
  * see if github provides blame api to figure out when it was committed
* Use e.g. `git log -S` to guess when links were added.
  * For example, the `more...` permalink here is broken: https://github.com/nice-registry/nice-package#nice-package---
* Figure out what's going on with 96bd92ba935682d06693c47775b93dec32d019c2
* Link both gist content and comments. See getGistFilesAndDatetimes usage

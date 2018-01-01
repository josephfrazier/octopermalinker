TODO
====

* Handle `/blame/` links
* Permalink urls in Reddit comments: https://www.reddit.com/r/reactjs/comments/4y43uc/react_router_how_to_deal_with_search_queries/d6l7q2f/
* Fix link at https://github.com/greenkeeperio/greenkeeper/issues/314#issuecomment-255737405
  * href is https://github.com/greenkeeperio/greenkeeper/blob/master/src/evilhackerdude.js
* Fix link at https://github.com/prettier/prettier/pull/2190#discussion_r122602431
  * href is https://github.com/tdeekens/prettier/blob/fix/css-modules-composes/src/doc-utils.js#L161
* Permalink urls in Hacker News comments: https://news.ycombinator.com/item?id=14110168
  * https://news.ycombinator.com/item?id=13917368
  * https://news.ycombinator.com/item?id=14697480
  * https://news.ycombinator.com/item?id=14807951
* handle wiki links - "wide-spectrum blocker" at https://github.com/gorhill/uBlock/tree/f4f52c32209348dc050b77b6e0d84b9be5897541#beware-ublock-origin-is-completely-unrelated-to-the-web-site-ublockorg
* permalink raw.githubusercontent.com links: https://web.archive.org/web/20170329173434id_/https://github.com/github/markup/issues/1022#issue-215368549
* permalink urls in code blobs: https://github.com/MatAtBread/fast-async/blob/fbd2c4db54813b5130f49a46f6280bcad17c7f53/plugin.js#L35
  * see if github provides blame api to figure out when it was committed
* Use e.g. `git log -S` to guess when links were added.
  * For example, the `more...` permalink here is broken: https://github.com/nice-registry/nice-package/tree/5388835b5412c2e5f448fbd5043117f07d87a210#nice-package---
* Figure out what's going on with 96bd92ba935682d06693c47775b93dec32d019c2

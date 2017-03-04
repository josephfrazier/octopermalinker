# OctoPermalinker [![Build Status](https://travis-ci.org/josephfrazier/octopermalinker.svg?branch=master)](https://travis-ci.org/josephfrazier/octopermalinker) [![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/josephfrazier/octopermalinker?svg=true&branch=master)](https://ci.appveyor.com/project/josephfrazier/octopermalinker)

OctoPermalinker is a browser extension that searches GitHub comments/files for links to files on branches, and adds a link to where the branch pointed when the comment/file was made/updated. This helps you avoid following a link that was broken after being posted. For context, here's some discussion about broken GitHub links: [Don't link to line numbers in GitHub](https://news.ycombinator.com/item?id=8046710).

# Install

See the Quick Start section of [the Contributing guide](./CONTRIBUTING.md).

# Features

### OAuth Support

Without authentication, [the GitHub API allows only 60 requests per hour](https://developer.github.com/v3/#rate-limiting). You can increase this to 5,000 requests per hour by [creating an OAuth token](https://github.com/settings/tokens) (no scopes needed) and entering it into the extension options page (at `chrome://extensions/` in Chrome, or `about:addons` -> Extensions in Firefox).

### Paste Protection

OctoPermalinker will also detect if you paste a fragile link into a comment box. When this happens, OctoPermalinker will notify you of the corresponding permalink, in case you'd like to use it instead.

# Want to contribute?

Anyone can help make this project better - check out the [Contributing](/CONTRIBUTING.md) guide!

# Feedback

If you encounter a problem using OctoPermalinker, or would like to request an enhancement, feel free to create an [issue](https://github.com/josephfrazier/octopermalinker/issues).

# Thanks

- [@stefanbuck](https://github.com/stefanbuck) for building [OctoLinker], which this project is based on.

[OctoLinker]: https://github.com/OctoLinker/browser-extension/

# Legal and License

The OctoPermalinker project is not affiliated with, sponsored by, or endorsed by github, inc.

Copyright (c) 2017–present [Joseph Frazier](https://github.com/josephfrazier) Licensed under the MIT license.

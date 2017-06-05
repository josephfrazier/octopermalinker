
# Contributing

First off, thanks for taking the time to contribute! :tada: :+1:

# Developer Guide

## Quick Start

To build and run the extension follow these steps.

1. Clone the repository.
1. Make sure [Yarn](https://yarnpkg.com/docs/install) is installed.
1. Run `yarn install` to setup the project and install all required dependencies.
1. Build and load the extension:
   * Firefox (Quickstart):
     1. `npm run firefox-open`
   * Chrome (Quickstart):
     1. `npm run chrome-open`
   * Chrome (Long Version):
     1. To build the extension once run `npm run chrome-build` or `npm run chrome-watch` during development.
     1. Load extension https://developer.chrome.com/extensions/getstarted#unpacked.

## Pull Request Guidelines

- Please check to make sure that there aren't existing pull requests attempting to address the issue mentioned. We also recommend checking for issues related to the issue on the tracker, as a team member may be working on the issue in a branch or fork.
- Non-trivial changes should be discussed in an issue first
- Develop in a topic branch, not master
- Lint the code by `npm run lint`
- Add relevant tests to cover the change
- Make sure test-suite passes: `npm test`
- Squash your commits
- Write a convincing description of your PR and why we should land it

## Release Checklist

- Run [`npm version patch`](https://docs.npmjs.com/cli/version) to update the version number. Use `minor` or `major` instead of `patch` if needed (see [semver.org](http://semver.org/) for details).
- Open a [pull request](https://github.com/josephfrazier/octopermalinker/pulls) with the new version.
- Once the pull request is merged in, tag the resulting commit as `vX.Y.Z` (where `X`, `Y`, `Z` are the major, minor, and patch versions).
- Push the tag to GitHub. This will trigger Travis CI to create a new [GitHub Release](https://github.com/josephfrazier/octopermalinker/releases) and submit the new Chrome extension to the Chrome Web Store. See [.travis.yml](https://github.com/josephfrazier/octopermalinker/blob/master/.travis.yml) for details.
- Submit `firefox-octopermalinker-X.Y.Z.zip` from the [GitHub Release](https://github.com/josephfrazier/octopermalinker/releases) to [addons.mozilla.org](https://addons.mozilla.org/en-US/developers/addon/octopermalinker/versions#version-upload). Be sure to include the `Source code (zip)` file from the release as well.
- Submit `opera-octopermalinker-X.Y.Z.zip` from the [GitHub Release](https://github.com/josephfrazier/octopermalinker/releases) to [addons.opera.com](https://addons.opera.com/developer/package/226344/?tab=versions). Afterwards, go to the [Conversation tab](https://addons.opera.com/developer/package/226344/?tab=conversation), add a link to the `Source code (zip)` file and copy/paste the build instructions from previous releases.
- Update release notes at https://github.com/josephfrazier/octopermalinker/releases/tag/vX.Y.Z. You can find a list of changes since the previous release at https://github.com/josephfrazier/octopermalinker/compare/vA.B.C...vX.Y.Z, where `A.B.C` is the previous version number.

import injection from 'github-injection';
import permalink from './permalinker.js';
import * as storage from './options/storage.js';

storage.load(() => {
  injection(window, () => permalink({
    token: storage.get('githubOauthToken'),
  }));
});

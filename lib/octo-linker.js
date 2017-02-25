import injection from 'github-injection';
import * as storage from './options/storage.js';
import permalink from './permalinker.js';


function run(self) {
  permalink();
}

export default class OctoLinkerCore {
  init() {
    injection(window, run.bind(null, this));
  }
}

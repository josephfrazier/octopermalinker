import injection from 'github-injection';
import md5hex from 'md5-hex';
import domify from 'domify';

export default function (global, cb) {
  const singletonId = md5hex(cb.toString());
  injection(global, () => {
    if (global.document.getElementById(singletonId)) {
      return;
    }
    global.document.body.appendChild(domify(`<div id="${singletonId}" />`));
    cb();
  });
}

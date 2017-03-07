import ChromePromise from 'chrome-promise';
import { options } from './options';

const chromep = new ChromePromise();
const store = {};
const defaults = {};

options.forEach((item) => {
  defaults[item.name] = item.defaultValue;
});

export const get = key => store[key];

export const set = async (key, value) => {
  const data = {
    [key]: value,
  };

  try {
    return await chromep.storage.sync.set(data);
  } catch (err) {
    return chromep.storage.local.set(data);
  }
};


export const load = async () => {
  let data;

  try {
    data = await chromep.storage.sync.get(null);
  } catch (err) {
    data = await chromep.storage.local.get(null);
  }

  Object.assign(store, defaults, data);
};

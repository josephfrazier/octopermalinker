import input from './input';

export default function ({ type, ...rest }) {
  if (type === 'input') {
    return input(rest);
  }
}

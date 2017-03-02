export default function ({ type, ...rest }) {
  if (type === 'input') {
    return input(rest);
  }
}

function input({ name, label, value, defaultValue }) {
  const val = (value === undefined) ? defaultValue : value;

  return `<section>
    <label>
      <input type="input" name="${name}" value="${val}" /> ${label}
    </label>
  </section>`;
}

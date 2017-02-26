export default ({ name, label, value, defaultValue }) => {
  const val = (value === undefined) ? defaultValue : value;

  return `<section>
    <label>
      <input type="input" name="${name}" value="${val}" /> ${label}
    </label>
  </section>`;
};

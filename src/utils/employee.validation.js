const FIELD_LIMITS = {
  first_name: 255,
  last_name: 255,
  email: 255,
  phone: 50,
  organization: 255,
  designation: 100,
};

const STRING_FIELDS = Object.keys(FIELD_LIMITS);
const EDITABLE_FIELDS = [...STRING_FIELDS, 'salary', 'status'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALARY_PATTERN = /^\d{1,9}(?:\.\d{1,2})?$/;

function validateEmployee(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { data, errors: ['Request body must be a JSON object.'] };
  }

  for (const key of Object.keys(body)) {
    if (!EDITABLE_FIELDS.includes(key)) {
      errors.push(`The field '${key}' cannot be changed.`);
    }
  }

  for (const field of STRING_FIELDS) {
    const isRequired = !partial;
    if (!(field in body)) {
      if (isRequired) errors.push(`'${field}' is required.`);
      continue;
    }

    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`'${field}' must be a non-empty string.`);
      continue;
    }

    const value = body[field].trim();
    if (value.length > FIELD_LIMITS[field]) {
      errors.push(`'${field}' must be at most ${FIELD_LIMITS[field]} characters.`);
      continue;
    }

    if (field === 'email' && !EMAIL_PATTERN.test(value)) {
      errors.push("'email' must be a valid email address.");
      continue;
    }

    data[field] = value;
  }

  if ('salary' in body) {
    const salary = String(body.salary);
    if (!SALARY_PATTERN.test(salary)) {
      errors.push("'salary' must be a non-negative amount with up to 2 decimal places.");
    } else {
      data.salary = Number(salary);
    }
  } else if (!partial) {
    data.salary = 0;
  }

  if ('status' in body) {
    if (body.status !== 0 && body.status !== 1 && body.status !== '0' && body.status !== '1') {
      errors.push("'status' must be 0 or 1.");
    } else {
      data.status = Number(body.status);
    }
  } else if (!partial) {
    data.status = 1;
  }

  if (partial && Object.keys(body).length === 0) {
    errors.push('Provide at least one field to update.');
  }

  return { data, errors };
}

function isValidId(id) {
  return typeof id === 'string' && /^[1-9]\d*$/.test(id);
}

module.exports = { validateEmployee, isValidId };

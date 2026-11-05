const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidId, validateEmployee } = require('../src/utils/employee.validation');

const validEmployee = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  organization: 'Example Inc.',
  designation: 'Engineer',
};

test('accepts a valid employee and applies database defaults', () => {
  const result = validateEmployee(validEmployee);
  assert.deepEqual(result.errors, []);
  assert.equal(result.data.salary, 0);
  assert.equal(result.data.status, 1);
});

test('rejects invalid email, salary, and status values', () => {
  const result = validateEmployee({
    ...validEmployee,
    email: 'not-an-email',
    salary: '-10',
    status: 2,
  });
  assert.equal(result.errors.length, 3);
});

test('supports partial updates but rejects empty updates', () => {
  assert.deepEqual(validateEmployee({ salary: '500.25' }, { partial: true }).errors, []);
  assert.ok(validateEmployee({}, { partial: true }).errors.length > 0);
});

test('accepts only positive integer ids', () => {
  assert.equal(isValidId('42'), true);
  assert.equal(isValidId('0'), false);
  assert.equal(isValidId('1 OR 1=1'), false);
});

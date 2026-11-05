const pool = require('../../config/db.config');

const SELECT_FIELDS = `id, first_name, last_name, email, phone, organization,
  designation, salary, status, created_at, updated_at`;

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_FIELDS} FROM employees WHERE is_deleted = 0 ORDER BY id`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${SELECT_FIELDS} FROM employees WHERE id = ? AND is_deleted = 0 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create(employee) {
  const [result] = await pool.execute(
    `INSERT INTO employees
      (first_name, last_name, email, phone, organization, designation, salary, status, is_deleted, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [
      employee.first_name,
      employee.last_name,
      employee.email,
      employee.phone,
      employee.organization,
      employee.designation,
      employee.salary,
      employee.status,
    ]
  );
  return findById(String(result.insertId));
}

async function updateById(id, employee) {
  const fields = Object.keys(employee);
  const assignments = fields.map((field) => `\`${field}\` = ?`).join(', ');
  await pool.execute(
    `UPDATE employees SET ${assignments} WHERE id = ? AND is_deleted = 0`,
    [...fields.map((field) => employee[field]), id]
  );
  return findById(id);
}

async function removeById(id) {
  const [result] = await pool.execute(
    'UPDATE employees SET is_deleted = 1 WHERE id = ? AND is_deleted = 0',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, updateById, removeById };

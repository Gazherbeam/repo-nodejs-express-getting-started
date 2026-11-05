const Employee = require('../models/employee.model');
const { isValidId, validateEmployee } = require('../utils/employee.validation');

function readId(req, res) {
  const id = String(req.params.id);
  if (!isValidId(id)) {
    res.status(400).json({ error: 'Employee id must be a positive integer.' });
    return null;
  }
  return id;
}

async function findAll(_req, res) {
  const employees = await Employee.findAll();
  res.json({ data: employees });
}

async function findOne(req, res) {
  const id = readId(req, res);
  if (!id) return;

  const employee = await Employee.findById(id);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }
  res.json({ data: employee });
}

async function create(req, res) {
  const { data, errors } = validateEmployee(req.body);
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  const employee = await Employee.create(data);
  res.status(201).json({ data: employee });
}

async function update(req, res) {
  const id = readId(req, res);
  if (!id) return;

  const { data, errors } = validateEmployee(req.body, { partial: true });
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  const employee = await Employee.updateById(id, data);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }
  res.json({ data: employee });
}

async function remove(req, res) {
  const id = readId(req, res);
  if (!id) return;

  const removed = await Employee.removeById(id);
  if (!removed) {
    res.status(404).json({ error: 'Employee not found.' });
    return;
  }
  res.status(204).end();
}

module.exports = { findAll, findOne, create, update, remove };

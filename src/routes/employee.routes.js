const express = require('express');
const employeeController = require('../controllers/employee.controller');

const router = express.Router();

router.get('/', employeeController.findAll);
router.get('/:id', employeeController.findOne);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

module.exports = router;

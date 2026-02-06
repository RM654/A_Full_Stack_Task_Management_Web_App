const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { authenticateToken } = require('./users'); // Import auth middleware

// Create new employee (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });

    let nextId = '001';
    if (lastEmployee && lastEmployee.employeeId) {
      const lastNum = parseInt(lastEmployee.employeeId);
      nextId = String(lastNum + 1).padStart(3, '0');
    }

    const { name, task, deadline } = req.body;

    const employee = new Employee({
      employeeId: nextId,
      name,
      task,
      deadline
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// Get employees by specific deadline date (protected)
router.get('/by-deadline', authenticateToken, async (req, res) => {
  try {
    const { deadline } = req.query;

    if (!deadline) {
      return res.status(400).json({ error: 'Deadline date is required' });
    }

    const start = new Date(deadline);
    const end = new Date(deadline);
    end.setDate(end.getDate() + 1); // include entire day

    const tasks = await Employee.find({
      deadline: {
        $gte: start,
        $lt: end
      }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark employee as complete by employeeId (protected)
router.patch('/complete/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { status: 'complete' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Status updated to complete', employee: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get employee by ID (protected)
router.get('/by-id/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear task, deadline, and status if complete (protected)
router.patch('/clear-fields/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    if (employee.status !== 'complete') {
      return res.status(400).json({ error: 'Cannot clear fields unless status is complete' });
    }

    employee.task = '';
    employee.deadline = null;
    employee.status = '';

    await employee.save();

    res.json({ message: 'Fields cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add a new task and deadline to an existing employee
router.patch('/add-task/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { task, deadline, status } = req.body;

    if (!task || !deadline) {
      return res.status(400).json({ error: 'Task and deadline are required' });
    }

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { task, deadline, status: status || 'incomplete' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Task added successfully', employee: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all employees (protected)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ employeeId: 1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





module.exports = router;

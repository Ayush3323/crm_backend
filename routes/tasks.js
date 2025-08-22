const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskProgress,
  addTaskComment,
  getEmployeeTasks,
  getTasksByUser
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('Admin', 'Sub Admin', 'Manager'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('Admin', 'Sub Admin'), deleteTask);

router.put('/:id/progress', updateTaskProgress);
router.post('/:id/comments', addTaskComment);

// Get tasks for specific employee (Admin, Sub Admin, Manager only)
router.get('/employee/:employeeId', authorize('Admin', 'Sub Admin', 'Manager'), getEmployeeTasks);

// Get tasks filtered by user role
router.get('/filter/:userId', getTasksByUser);

module.exports = router; 
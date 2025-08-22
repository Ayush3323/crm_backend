const express = require('express');
const {
  getUsers,
  getEmployees,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
router.use(protect);

// Routes accessible by Admin and Sub Admin
router.route('/')
  .get(authorize('Admin', 'Sub Admin'), getUsers)
  .post(authorize('Admin', 'Sub Admin'), createUser);

// Get employees only (Admin, Sub Admin, Manager)
router.get('/employees', authorize('Admin', 'Sub Admin', 'Manager'), getEmployees);

// Get user statistics (Admin, Sub Admin)
router.get('/stats', authorize('Admin', 'Sub Admin'), getUserStats);

router.route('/:id')
  .get(authorize('Admin', 'Sub Admin'), getUser)
  .put(authorize('Admin', 'Sub Admin'), updateUser)
  .delete(authorize('Admin', 'Sub Admin'), deleteUser);

router.put('/:id/reset-password', authorize('Admin', 'Sub Admin'), resetUserPassword);

module.exports = router; 
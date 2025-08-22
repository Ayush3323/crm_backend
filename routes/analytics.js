const express = require('express');
const {
  getDashboardAnalytics,
  getTaskAnalytics,
  getMachineAnalytics,
  getUserAnalytics
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/tasks', getTaskAnalytics);
router.get('/machines', getMachineAnalytics);
router.get('/users', getUserAnalytics);

module.exports = router; 
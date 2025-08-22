const express = require('express');
const {
  getMachines,
  getMachine,
  createMachine,
  updateMachine,
  deleteMachine,
  addMaintenanceRecord,
  updateMachineStatus
} = require('../controllers/machineController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
router.use(protect);

// Routes accessible by all authenticated users
router.route('/')
  .get(getMachines)
  .post(authorize('Admin', 'Sub Admin'), createMachine);

router.route('/:id')
  .get(getMachine)
  .put(authorize('Admin', 'Sub Admin'), updateMachine)
  .delete(authorize('Admin', 'Sub Admin'), deleteMachine);

// Machine specific operations
router.put('/:id/status', authorize('Admin', 'Sub Admin', 'Manager'), updateMachineStatus);
router.post('/:id/maintenance', authorize('Admin', 'Sub Admin', 'Manager'), addMaintenanceRecord);

module.exports = router; 
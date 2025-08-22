const { Machine, Task } = require('../models/index');
const crypto = require('crypto');

// @desc    Get all machines
// @route   GET /api/machines
// @access  Private
exports.getMachines = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { status, department } = req.query;

    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;

    const { count, rows: machines } = await Machine.findAndCountAll({
      where,
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      count: machines.length,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        limit
      },
      data: machines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
exports.getMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new machine
// @route   POST /api/machines
// @access  Private
exports.createMachine = async (req, res, next) => {
  try {
    const machine = await Machine.create({
      ...req.body,
      status: req.body.status || 'Operational',
      efficiency: req.body.efficiency || 100,
      alerts: req.body.alerts || [],
      maintenanceHistory: req.body.maintenanceHistory || []
    });

    res.status(201).json({
      success: true,
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update machine
// @route   PUT /api/machines/:id
// @access  Private
exports.updateMachine = async (req, res, next) => {
  try {
    let machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    machine = await machine.update(req.body);

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Private
exports.deleteMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Set machineId to null for associated tasks
    await Task.update({ machineId: null }, { where: { machineId: req.params.id } });

    await machine.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update machine status
// @route   PUT /api/machines/:id/status
// @access  Private
exports.updateMachineStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Operational', 'Maintenance', 'Repair', 'Offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Operational, Maintenance, Repair, Offline'
      });
    }

    let machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    machine = await machine.update({ status });

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add maintenance record
// @route   POST /api/machines/:id/maintenance
// @access  Private
exports.addMaintenanceRecord = async (req, res, next) => {
  try {
    const { type, description, cost, technician } = req.body;

    const machine = await Machine.findByPk(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const maintenanceRecord = {
      id: crypto.randomUUID(),
      type,
      description,
      cost: cost || 0,
      technician: technician || req.user.id,
      technicianName: req.user.name,
      date: new Date(),
      status: 'Completed'
    };

    const maintenanceHistory = machine.maintenanceHistory || [];
    maintenanceHistory.push(maintenanceRecord);

    const updatedMachine = await machine.update({
      maintenanceHistory,
      status: 'Operational'
    });

    res.status(200).json({
      success: true,
      data: updatedMachine
    });
  } catch (error) {
    next(error);
  }
};
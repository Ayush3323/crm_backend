const { User, Task, Machine, sequelize } = require('../models/index');
const { Op } = require('sequelize');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalTasks = await Task.count();
    const totalMachines = await Machine.count();

    const taskStatus = await Task.findAll({
      group: ['status'],
      attributes: ['status', [sequelize.fn('COUNT', 'status'), 'count']]
    });

    const taskPriority = await Task.findAll({
      group: ['priority'],
      attributes: ['priority', [sequelize.fn('COUNT', 'priority'), 'count']]
    });

    const machineStatus = await Machine.findAll({
      group: ['status'],
      attributes: ['status', [sequelize.fn('COUNT', 'status'), 'count']]
    });

    const userRole = await User.findAll({
      group: ['role'],
      attributes: ['role', [sequelize.fn('COUNT', 'role'), 'count']]
    });

    const recentTasks = await Task.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name'] }
      ]
    });

    const avgEfficiency = await Machine.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('efficiency')), 'avgEfficiency']]
    });

    const formatDistribution = (data, keyField) => 
      data.reduce((acc, item) => {
        acc[item.getDataValue(keyField)] = item.getDataValue('count');
        return acc;
      }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalTasks,
          totalMachines,
          machineEfficiency: Math.round(avgEfficiency.getDataValue('avgEfficiency') || 0)
        },
        taskStatusDistribution: formatDistribution(taskStatus, 'status'),
        taskPriorityDistribution: formatDistribution(taskPriority, 'priority'),
        machineStatusDistribution: formatDistribution(machineStatus, 'status'),
        userRoleDistribution: formatDistribution(userRole, 'role'),
        recentTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task analytics
// @route   GET /api/analytics/tasks
// @access  Private
exports.getTaskAnalytics = async (req, res, next) => {
  try {
    const totalTasks = await Task.count();
    const completedTasks = await Task.count({ where: { status: 'Completed' } });
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const avgProgress = await Task.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']]
    });

    const byCategory = await Task.findAll({
      group: ['category'],
      attributes: ['category', [sequelize.fn('COUNT', 'category'), 'count']]
    });

    const byUser = await Task.findAll({
      group: ['assignedUser.id', 'assignedUser.name'],
      attributes: [[sequelize.fn('COUNT', 'assignedTo'), 'count']],
      include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name'] }]
    });

    const tasksByCategory = byCategory.reduce((acc, item) => {
      acc[item.category || 'Uncategorized'] = item.getDataValue('count');
      return acc;
    }, {});

    const tasksByUser = byUser.reduce((acc, item) => {
      if (item.assignedUser) {
        acc[item.assignedUser.name] = item.getDataValue('count');
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        completionRate: Math.round(completionRate),
        averageProgress: Math.round(avgProgress.getDataValue('avgProgress') || 0),
        tasksByCategory,
        tasksByUser,
        totalTasks,
        completedTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get machine analytics
// @route   GET /api/analytics/machines
// @access  Private
exports.getMachineAnalytics = async (req, res, next) => {
  try {
    const totalMachines = await Machine.count();
    const operationalMachines = await Machine.count({ where: { status: 'Operational' } });
    const operationalPercentage = totalMachines > 0 ? (operationalMachines / totalMachines) * 100 : 0;

    const avgEfficiency = await Machine.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('efficiency')), 'avgEfficiency']]
    });

    const byDepartment = await Machine.findAll({
      group: ['department'],
      attributes: ['department', [sequelize.fn('COUNT', 'department'), 'count']]
    });

    const maintenance = await Machine.findAll({
      attributes: ['name', [sequelize.fn('JSON_LENGTH', sequelize.col('maintenanceHistory')), 'maintenanceCount']]
    });

    const machinesByDepartment = byDepartment.reduce((acc, item) => {
      acc[item.department || 'Unassigned'] = item.getDataValue('count');
      return acc;
    }, {});

    const maintenanceFrequency = maintenance.reduce((acc, item) => {
      acc[item.name] = item.getDataValue('maintenanceCount') || 0;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        averageEfficiency: Math.round(avgEfficiency.getDataValue('avgEfficiency') || 0),
        machinesByDepartment,
        maintenanceFrequency,
        operationalPercentage: Math.round(operationalPercentage),
        totalMachines,
        operationalMachines
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'Active' } });

    const userStatus = await User.findAll({
      group: ['status'],
      attributes: ['status', [sequelize.fn('COUNT', 'status'), 'count']]
    });

    const byDepartment = await User.findAll({
      group: ['department'],
      attributes: ['department', [sequelize.fn('COUNT', 'department'), 'count']]
    });

    const tasksPerUserQuery = await Task.findAll({
      group: ['assignedUser.id', 'assignedUser.name'],
      attributes: [[sequelize.fn('COUNT', 'assignedTo'), 'count']],
      include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name'] }]
    });

    const recentUsers = await User.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    const userStatusDistribution = userStatus.reduce((acc, item) => {
      acc[item.status] = item.getDataValue('count');
      return acc;
    }, {});

    const usersByDepartment = byDepartment.reduce((acc, item) => {
      acc[item.department || 'Unassigned'] = item.getDataValue('count');
      return acc;
    }, {});

    const tasksPerUser = tasksPerUserQuery.reduce((acc, item) => {
      if (item.assignedUser) {
        acc[item.assignedUser.name] = item.getDataValue('count');
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        userStatusDistribution,
        usersByDepartment,
        tasksPerUser,
        recentUsers,
        totalUsers,
        activeUsers
      }
    });
  } catch (error) {
    next(error);
  }
};
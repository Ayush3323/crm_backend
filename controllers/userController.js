const { User } = require('../models/index');
const crypto = require('crypto');

// @desc    Get all users (filtered by role if specified)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { role, department, status } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (status) filter.status = status;

    const users = await User.findAll({
      where: filter,
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employees only
// @route   GET /api/users/employees
// @access  Private (Admin, Sub Admin, Manager)
exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await User.findAll({
      where: { role: 'Employee' },
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || 'General',
      phone: phone || '',
      address: address || ''
    });

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash password if provided
    await user.update(req.body);

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has assigned tasks
    const userTasks = await Task.count({ where: { assignedTo: req.params.id } });
    if (userTasks > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with assigned tasks. Please reassign tasks first.'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new password
    const newPassword = crypto.randomBytes(8).toString('hex');
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      newPassword
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin, Sub Admin)
exports.getUserStats = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const tasks = await Task.findAll();

    // Count by role
    const roleStats = {
      Admin: users.filter(user => user.role === 'Admin').length,
      'Sub Admin': users.filter(user => user.role === 'Sub Admin').length,
      Manager: users.filter(user => user.role === 'Manager').length,
      Employee: users.filter(user => user.role === 'Employee').length
    };

    // Count by status
    const statusStats = {
      Active: users.filter(user => user.status === 'Active').length,
      Inactive: users.filter(user => user.status === 'Inactive').length,
      Suspended: users.filter(user => user.status === 'Suspended').length
    };

    // Count by department
    const departmentStats = {};
    users.forEach(user => {
      const dept = user.department || 'Unassigned';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    // Tasks per user
    const tasksPerUser = {};
    tasks.forEach(task => {
      const assignedTo = task.assignedTo || 'Unassigned';
      tasksPerUser[assignedTo] = (tasksPerUser[assignedTo] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers: users.length,
        roleStats,
        statusStats,
        departmentStats,
        tasksPerUser
      }
    });
  } catch (error) {
    next(error);
  }
}; 
const { Task, User, Machine, sequelize } = require('../models/index');
const { Op } = require('sequelize');

// @desc    Get all tasks (filtered by user role)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { status, priority, assignedTo } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: Machine, as: 'machineDetails', attributes: ['id', 'name', 'model', 'status'] }
      ]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        limit
      },
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: Machine, as: 'machineDetails', attributes: ['id', 'name', 'model', 'status'] }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task (only if authentication is enabled)
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, Sub Admin, Manager)
exports.createTask = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { 
      title, 
      description, 
      assignedTo, 
      employees, 
      deadline, 
      priority, 
      machine, 
      category,
      estimatedHours,
      location,
      isRecurring,
      recurringPattern
    } = req.body;

    console.log('Backend - Received request body:', {
      title,
      description,
      assignedTo,
      employees,
      employeesType: typeof employees,
      employeesIsArray: Array.isArray(employees),
      deadline,
      priority,
      machine,
      category,
      estimatedHours,
      location,
      isRecurring,
      recurringPattern
    });

    // Validate required fields
    if (!title || !description || !assignedTo || !employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, assignedTo (Manager), and employees are required'
      });
    }

    // Validate that assignedTo is a Manager
    const assignedUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ id: assignedTo }, { name: assignedTo }],
        role: 'Manager'
      } 
    });
    if (!assignedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assigned user must be a Manager' 
      });
    }

    // Validate that all employees exist and are Employees
    const employeeUsers = await User.findAll({ 
      where: { 
        id: { [Op.in]: employees },
        role: 'Employee'
      } 
    });
    if (employeeUsers.length !== employees.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'One or more assigned employees not found or not employees' 
      });
    }

    let machineId = null;
    if (machine) {
      const machineInstance = await Machine.findOne({ where: { [Op.or]: [{ id: machine }, { name: machine }] } });
      if (!machineInstance) {
        return res.status(404).json({ success: false, message: 'Machine not found' });
      }
      machineId = machineInstance.id;
    }

    console.log('Backend - Creating task with data:', {
      title,
      description,
      assignedTo: assignedUser.id,
      employees: employees,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: priority || 'Medium',
      machine: machineId,
      category: category || 'Production',
      estimatedHours: estimatedHours || 0,
      location: location || '',
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || 'Weekly',
      createdBy: req.user.id
    });

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedUser.id,
      employees: employees,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: priority || 'Medium',
      machine: machineId,
      category: category || 'Production',
      estimatedHours: estimatedHours || 0,
      location: location || '',
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || 'Weekly',
      createdBy: req.user.id
    });

    console.log('Backend - Task created successfully:', {
      id: task.id,
      employees: task.employees,
      assignedTo: task.assignedTo
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: Machine, as: 'machineDetails', attributes: ['id', 'name', 'model', 'status'] }
      ]
    });

    console.log('Backend - Final response data:', {
      id: createdTask.id,
      employees: createdTask.employees,
      assignedTo: createdTask.assignedTo,
      assignedUser: createdTask.assignedUser?.id
    });

    res.status(201).json({
      success: true,
      data: createdTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Only Admin, Sub Admin, and Manager can update certain fields
    let updateData = req.body;

    if (req.user && req.user.role === 'Employee') {
      const allowedFields = ['deadline', 'priority', 'machine', 'progress', 'status'];
      updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
    }

    const updatedTask = await task.update(updateData);

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Sub Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task progress
// @route   PUT /api/tasks/:id/progress
// @access  Private
exports.updateTaskProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to this task
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const updateData = { progress };

    // Update status based on progress
    if (progress === 100) {
      updateData.status = 'Completed';
    } else if (progress > 0) {
      updateData.status = 'In Progress';
    }

    const updatedTask = await task.update(updateData);

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addTaskComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to this task or is admin/manager
    if (req.user && req.user.role === 'Employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }

    const newComment = {
      id: crypto.randomUUID(),
      user: req.user.id,
      userName: req.user.name,
      comment,
      createdAt: new Date()
    };

    const comments = task.comments || [];
    comments.push(newComment);

    const updatedTask = await task.update({ comments });

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks filtered by user ID and role
// @route   GET /api/tasks/filter/:userId
// @access  Public (for Employee filtering)
exports.getTasksByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const where = {};
    if (user.role === 'Employee') {
      where.assignedTo = userId;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: Machine, as: 'machineDetails', attributes: ['id', 'name', 'model', 'status'] }
      ]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for specific employee
// @route   GET /api/tasks/employee/:employeeId
// @access  Private (Admin, Sub Admin, Manager)
exports.getEmployeeTasks = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Check if employee exists
    const employee = await User.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const offset = (page - 1) * limit;
    const where = { assignedTo: employeeId };

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name', 'email', 'role'] },
        { model: Machine, as: 'machineDetails', attributes: ['id', 'name', 'model', 'status'] }
      ]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        limit
      },
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 500]
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  employees: {
    type: DataTypes.JSON, // Storing as JSON
    defaultValue: []
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  machine: {
    type: DataTypes.INTEGER,
  },
  category: {
    type: DataTypes.ENUM('Production', 'Maintenance', 'Quality Check', 'Training', 'Other'),
    defaultValue: 'Other'
  },
  attachments: {
    type: DataTypes.JSON, // Storing as JSON
    defaultValue: []
  },
  comments: {
    type: DataTypes.JSON, // Storing as JSON
    defaultValue: []
  },
  estimatedHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  actualHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  tags: {
    type: DataTypes.JSON, // Storing as JSON
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringPattern: {
    type: DataTypes.ENUM('Daily', 'Weekly', 'Monthly', 'Yearly'),
    defaultValue: 'Weekly'
  },
  createdBy: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['assignedTo', 'status'] },
    { fields: ['deadline'] },
    { fields: ['priority'] }
  ]
});

  Task.associate = (models) => {
    Task.belongsTo(models.User, { as: 'assignedUser', foreignKey: 'assignedTo' });
    Task.belongsTo(models.User, { as: 'createdByUser', foreignKey: 'createdBy' });
    Task.belongsTo(models.Machine, { as: 'machineDetails', foreignKey: 'machine' });
  };

  return Task;
};
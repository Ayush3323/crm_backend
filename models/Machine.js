const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Machine = sequelize.define('Machine', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
    unique: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serialNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('Operational', 'Maintenance', 'Repair', 'Offline', 'Retired'),
    defaultValue: 'Operational'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Production'
  },
  manufacturer: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  installationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  nextMaintenance: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  maintenanceInterval: {
    type: DataTypes.INTEGER, // in days
    defaultValue: 30
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  assignedTechnician: {
    type: DataTypes.INTEGER,
  },
  operatingHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  efficiency: {
    type: DataTypes.FLOAT,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  notes: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500]
    }
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  maintenanceHistory: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  alerts: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['location'] },
    { fields: ['nextMaintenance'] }
  ]
});

  Machine.associate = (models) => {
    Machine.belongsTo(models.User, { foreignKey: 'assignedTechnician' });
    Machine.hasMany(models.Task, { foreignKey: 'machine' });
  };

  return Machine;
};
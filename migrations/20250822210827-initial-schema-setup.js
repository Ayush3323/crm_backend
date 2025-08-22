'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('Admin', 'Sub Admin', 'Manager', 'Employee'),
        defaultValue: 'Employee'
      },
      status: {
        type: Sequelize.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active'
      },
      avatar: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      lastLogin: {
        type: Sequelize.DATE
      },
      resetPasswordToken: {
        type: Sequelize.STRING
      },
      resetPasswordExpire: {
        type: Sequelize.DATE
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      twoFactorEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Machines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      serialNumber: {
        type: Sequelize.STRING,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('Operational', 'Maintenance', 'Repair', 'Offline', 'Retired'),
        defaultValue: 'Operational'
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      department: {
        type: Sequelize.STRING
      },
      manufacturer: {
        type: Sequelize.STRING
      },
      installationDate: {
        type: Sequelize.DATE
      },
      lastMaintenance: {
        type: Sequelize.DATE
      },
      nextMaintenance: {
        type: Sequelize.DATE
      },
      maintenanceInterval: {
        type: Sequelize.INTEGER
      },
      specifications: {
        type: Sequelize.JSON
      },
      assignedTechnician: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      operatingHours: {
        type: Sequelize.FLOAT
      },
      efficiency: {
        type: Sequelize.FLOAT
      },
      notes: {
        type: Sequelize.TEXT
      },
      documents: {
        type: Sequelize.JSON
      },
      maintenanceHistory: {
        type: Sequelize.JSON
      },
      alerts: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      assignedTo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      employees: {
        type: Sequelize.JSON
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High', 'Critical'),
        defaultValue: 'Medium'
      },
      status: {
        type: Sequelize.ENUM('Pending', 'In Progress', 'Completed', 'Cancelled'),
        defaultValue: 'Pending'
      },
      progress: {
        type: Sequelize.INTEGER
      },
      machine: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Machines',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      category: {
        type: Sequelize.ENUM('Production', 'Maintenance', 'Quality Check', 'Training', 'Other'),
        defaultValue: 'Other'
      },
      attachments: {
        type: Sequelize.JSON
      },
      comments: {
        type: Sequelize.JSON
      },
      estimatedHours: {
        type: Sequelize.FLOAT
      },
      actualHours: {
        type: Sequelize.FLOAT
      },
      tags: {
        type: Sequelize.JSON
      },
      location: {
        type: Sequelize.STRING
      },
      isRecurring: {
        type: Sequelize.BOOLEAN
      },
      recurringPattern: {
        type: Sequelize.ENUM('Daily', 'Weekly', 'Monthly', 'Yearly')
      },
      createdBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Machines', ['status']);
    await queryInterface.addIndex('Machines', ['location']);
    await queryInterface.addIndex('Machines', ['nextMaintenance']);
    await queryInterface.addIndex('Tasks', ['assignedTo', 'status']);
    await queryInterface.addIndex('Tasks', ['deadline']);
    await queryInterface.addIndex('Tasks', ['priority']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tasks');
    await queryInterface.dropTable('Machines');
    await queryInterface.dropTable('Users');
  }
};

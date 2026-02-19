module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define('Lead', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'converted'),
      defaultValue: 'new',
      allowNull: false,
      validate: {
        isIn: [['new', 'contacted', 'qualified', 'converted']]
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    convertedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'leads',
    timestamps: true
  });

  Lead.associate = (models) => {
    Lead.belongsTo(models.Employee, {
      foreignKey: 'assignedTo',
      as: 'assignedEmployee'
    });
    Lead.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'client'
    });
  };

  return Lead;
};

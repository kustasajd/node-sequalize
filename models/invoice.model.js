module.exports = (sequelize, Sequelize) => {
  const Invoice = sequelize.define("invoice", {
    invoiceId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    clientId: {
      type: Sequelize.INTEGER,
      required: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    currencyId: {
      type: Sequelize.INTEGER,
      required: true
    },
    dateCreated: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    invoiceStatusTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    licenceId: {
      type: Sequelize.INTEGER
    },
    termsDays: {
      type: Sequelize.INTEGER
    },
    dueDate: {
      type: Sequelize.DATE
    },
    createdByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    notes: {
      type: Sequelize.STRING,
    },
    periodStart: {
      type: Sequelize.DATE
    },
    periodEnd: {
      type: Sequelize.DATE
    },
    totalChargesIncTax: {
      type: Sequelize.DECIMAL
    },
    totaltax: {
      type: Sequelize.DECIMAL
    }
  }, {
    timestamps: false
  });

  Invoice.associate = function (models) {
    this.belongsTo(models.client, {
      foreignKey: 'clientId'
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });  
    this.belongsTo(models.currency, {
      foreignKey: 'currencyId'
    });
    this.belongsTo(models.invoiceStatusType, {
      foreignKey: 'invoiceStatusTypeId'
    });
    this.belongsTo(models.licence, {
      foreignKey: 'licenceId'
    });
    this.belongsTo(models.user, {
      foreignKey: 'createdByUserId'
    });
    this.hasMany(models.chargeRegister, {
      foreignKey: 'invoiceId'
    });
    this.hasMany(models.invoiceStatusHistory, {
      foreignKey: 'invoiceId'
    });
    this.hasMany(models.payment, {
      foreignKey: 'invoiceId'
    });
  };

  return Invoice;
};

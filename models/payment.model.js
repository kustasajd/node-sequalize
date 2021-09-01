module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("payment", {
    paymentId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    paymentTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    invoiceId: {
      type: Sequelize.INTEGER,
      required: true
    },
    amount: {
      type: Sequelize.DECIMAL,
      required: true
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    addedByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    clientId: {
      type: Sequelize.INTEGER
    },
    siteId: {
      type: Sequelize.INTEGER
    },
    currencyId: {
      type: Sequelize.INTEGER,
      required: true
    },
  }, {
    timestamps: false
  });

  Payment.associate = function (models) {
    this.belongsTo(models.paymentType, {
      foreignKey: 'paymentTypeId'
    });  
    this.belongsTo(models.invoice, {
      foreignKey: 'invoiceId'
    });
    this.belongsTo(models.user, {
      foreignKey: 'addedByUserId'
    });
    this.belongsTo(models.client, {
      foreignKey: 'clientId'
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });
    this.belongsTo(models.currency, {
      foreignKey: 'currencyId'
    });
  };

  return Payment;
};
